# ====================================================
# Project QuantumLedger - Terraform Variables
# ====================================================

variable "primary_region" {
  type        = string
  description = "Primary AWS Cloud deployment region for CBDC core"
  default     = "us-east-1"
}

variable "backup_region" {
  type        = string
  description = "Secondary AWS Cloud region for Disaster Recovery site"
  default     = "us-west-2"
}

variable "environment" {
  type        = string
  description = "Deployment Environment Tier"
  default     = "production"
}

variable "db_master_password" {
  type        = string
  description = "Master database password for dynamic credentials setup"
  sensitive   = true
  default     = "QuantumDbSecPass2026!#"
}
