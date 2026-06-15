# ====================================================
# Project QuantumLedger - Terraform Outputs
# ====================================================

output "primary_vpc_id" {
  value       = module.vpc_primary.vpc_id
  description = "VPC ID of the primary region (us-east-1)"
}

output "dr_vpc_id" {
  value       = module.vpc_dr.vpc_id
  description = "VPC ID of the DR region (us-west-2)"
}

output "primary_eks_endpoint" {
  value       = module.eks_primary.eks_cluster_endpoint
  description = "Primary Kubernetes API endpoint"
}

output "dr_eks_endpoint" {
  value       = module.eks_dr.eks_cluster_endpoint
  description = "DR Standby Kubernetes API endpoint"
}

output "ecr_api_repository_url" {
  value       = aws_ecr_repository.cbdc_api.repository_url
  description = "ECR registry endpoint for CBDC API container image"
}

output "database_primary_endpoint" {
  value       = aws_rds_cluster.db_primary.endpoint
  description = "Primary Aurora Cluster endpoint (Write Node)"
}

output "database_dr_endpoint" {
  value       = aws_rds_cluster.db_dr.reader_endpoint
  description = "DR Aurora Cluster reader endpoint (Read Replica)"
}

output "kms_vault_unseal_primary_arn" {
  value       = aws_kms_key.vault_unseal_primary.arn
  description = "KMS ARN used for Vault Auto-Unseal in primary region"
}
