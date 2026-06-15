# ====================================================
# Project QuantumLedger - Infrastructure Provisioning
# ====================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

# Primary Region Provider Configuration
provider "aws" {
  region = var.primary_region
}

# Secondary (DR) Region Provider Configuration
provider "aws" {
  alias  = "dr"
  region = var.backup_region
}

# ==========================================
# 1. Primary Network Topology (us-east-1)
# ==========================================

module "vpc_primary" {
  source = "./modules/vpc"

  environment        = var.environment
  region             = var.primary_region
  vpc_cidr           = "10.0.0.0/16"
  public_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets    = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
  database_subnets   = ["10.0.20.0/24", "10.0.21.0/24", "10.0.22.0/24"]
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# ==========================================
# 2. DR Network Topology (us-west-2)
# ==========================================

module "vpc_dr" {
  source = "./modules/vpc"
  providers = {
    aws = aws.dr
  }

  environment        = var.environment
  region             = var.backup_region
  vpc_cidr           = "10.1.0.0/16"
  public_subnets     = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
  private_subnets    = ["10.1.10.0/24", "10.1.11.0/24", "10.1.12.0/24"]
  database_subnets   = ["10.1.20.0/24", "10.1.21.0/24", "10.1.22.0/24"]
  availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

# ==========================================
# 3. ECR Registries for CBDC Docker Images
# ==========================================

resource "aws_ecr_repository" "cbdc_api" {
  name                 = "quantumledger/cbdc-api"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "cbdc_ledger" {
  name                 = "quantumledger/cbdc-ledger"
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

# ==========================================
# 4. Primary EKS Cluster (us-east-1)
# ==========================================

module "eks_primary" {
  source = "./modules/eks"

  cluster_name    = "quantumledger-primary"
  environment     = var.environment
  vpc_id          = module.vpc_primary.vpc_id
  private_subnets = module.vpc_primary.private_subnet_ids
  node_instance_types = ["m5.xlarge"]
  desired_size    = 6
  max_size        = 15
  min_size        = 3
}

# ==========================================
# 5. Backup EKS Cluster (us-west-2)
# ==========================================

module "eks_dr" {
  source = "./modules/eks"
  providers = {
    aws = aws.dr
  }

  cluster_name    = "quantumledger-dr"
  environment     = var.environment
  vpc_id          = module.vpc_dr.vpc_id
  private_subnets = module.vpc_dr.private_subnet_ids
  node_instance_types = ["m5.xlarge"]
  desired_size    = 3
  max_size        = 15
  min_size        = 1
}

# ==========================================
# 6. KMS Master Keys for Vault & DB Encryption
# ==========================================

resource "aws_kms_key" "vault_unseal_primary" {
  description             = "KMS Key for HashiCorp Vault Auto-Unseal in us-east-1"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
    Service     = "Vault-Security"
  }
}

resource "aws_kms_key" "vault_unseal_dr" {
  provider                = aws.dr
  description             = "KMS Key for HashiCorp Vault Auto-Unseal in us-west-2"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Environment = var.environment
    Service     = "Vault-Security"
  }
}

# ==========================================
# 7. Global Aurora Database (Consensus Storage)
# ==========================================

resource "aws_rds_global_cluster" "cbdc_global_db" {
  global_cluster_identifier = "quantumledger-global-db"
  engine                    = "aurora-postgresql"
  engine_version            = "15.4"
  database_name             = "cbdc_transactions"
}

resource "aws_rds_cluster" "db_primary" {
  cluster_identifier        = "quantumledger-db-primary"
  global_cluster_identifier = aws_rds_global_cluster.cbdc_global_db.id
  engine                    = aws_rds_global_cluster.cbdc_global_db.engine
  engine_version            = aws_rds_global_cluster.cbdc_global_db.engine_version
  master_username           = "quantum_admin"
  master_password           = var.db_master_password
  db_subnet_group_name      = module.vpc_primary.db_subnet_group_name
  vpc_security_group_ids    = [module.vpc_primary.db_security_group_id]
  kms_key_id                = aws_kms_key.vault_unseal_primary.arn
  storage_encrypted         = true
  backup_retention_period   = 7
  preferred_backup_window   = "02:00-03:00"
}

resource "aws_rds_cluster_instance" "db_primary_instances" {
  count              = 2
  identifier         = "quantumledger-db-primary-node-${count.index}"
  cluster_identifier = aws_rds_cluster.db_primary.id
  instance_class     = "db.r6g.xlarge"
  engine             = aws_rds_cluster.db_primary.engine
  engine_version     = aws_rds_cluster.db_primary.engine_version
}

# Read replica cluster in DR region
resource "aws_rds_cluster" "db_dr" {
  provider                  = aws.dr
  cluster_identifier        = "quantumledger-db-dr"
  global_cluster_identifier = aws_rds_global_cluster.cbdc_global_db.id
  engine                    = aws_rds_global_cluster.cbdc_global_db.engine
  engine_version            = aws_rds_global_cluster.cbdc_global_db.engine_version
  db_subnet_group_name      = module.vpc_dr.db_subnet_group_name
  vpc_security_group_ids    = [module.vpc_dr.db_security_group_id]
  kms_key_id                = aws_kms_key.vault_unseal_dr.arn
  storage_encrypted         = true
  depends_on                = [aws_rds_cluster.db_primary]
}

resource "aws_rds_cluster_instance" "db_dr_instances" {
  provider           = aws.dr
  count              = 1
  identifier         = "quantumledger-db-dr-node-${count.index}"
  cluster_identifier = aws_rds_cluster.db_dr.id
  instance_class     = "db.r6g.xlarge"
  engine             = aws_rds_cluster.db_dr.engine
  engine_version     = aws_rds_cluster.db_dr.engine_version
}
