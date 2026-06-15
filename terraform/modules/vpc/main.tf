# ====================================================
# Project QuantumLedger - Terraform VPC Module
# ====================================================

variable "environment" { type = string }
variable "region" { type = string }
variable "vpc_cidr" { type = string }
variable "public_subnets" { type = list(string) }
variable "private_subnets" { type = list(string) }
variable "database_subnets" { type = list(string) }
variable "availability_zones" { type = list(string) }

# VPC Resource
resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "quantumledger-vpc-${var.environment}"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags = {
    Name = "quantumledger-igw-${var.environment}"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = length(var.public_subnets)
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                                     = "quantumledger-public-subnet-${count.index}-${var.environment}"
    "kubernetes.io/role/elb"                                 = "1"
    "kubernetes.io/cluster/quantumledger-${var.environment}" = "shared"
  }
}

# Private Subnets (For EKS Node Groups)
resource "aws_subnet" "private" {
  count             = length(var.private_subnets)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name                                                     = "quantumledger-private-subnet-${count.index}-${var.environment}"
    "kubernetes.io/role/internal-elb"                        = "1"
    "kubernetes.io/cluster/quantumledger-${var.environment}" = "shared"
  }
}

# Database Subnets (For Aurora Database nodes)
resource "aws_subnet" "database" {
  count             = length(var.database_subnets)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.database_subnets[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "quantumledger-db-subnet-${count.index}-${var.environment}"
  }
}

# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"
  tags = {
    Name = "quantumledger-nat-eip-${var.environment}"
  }
}

# NAT Gateway
resource "aws_nat_gateway" "this" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id
  tags = {
    Name = "quantumledger-nat-${var.environment}"
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }
  tags = {
    Name = "quantumledger-public-rt-${var.environment}"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this.id
  }
  tags = {
    Name = "quantumledger-private-rt-${var.environment}"
  }
}

# Route Table Associations
resource "aws_route_table_association" "public" {
  count          = length(var.public_subnets)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(var.private_subnets)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# RDS Database Subnet Group
resource "aws_db_subnet_group" "db_group" {
  name        = "quantumledger-db-subnet-group-${var.environment}"
  description = "Subnet group for database clusters"
  subnet_ids  = aws_subnet.database[*].id
}

# RDS Security Group
resource "aws_security_group" "db_sg" {
  name        = "quantumledger-db-sg-${var.environment}"
  description = "Access security rules for ledger databases"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "Allow DB access from private subnets (EKS nodes)"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.private_subnets
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Module Outputs
output "vpc_id" { value = aws_vpc.this.id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
output "db_subnet_group_name" { value = aws_db_subnet_group.db_group.name }
output "db_security_group_id" { value = aws_security_group.db_sg.id }
