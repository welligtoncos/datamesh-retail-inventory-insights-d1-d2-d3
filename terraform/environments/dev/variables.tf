variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "sa-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used in tags and IAM naming"
  type        = string
  default     = "retail-inventory-insights"
}

variable "bucket_name" {
  description = "S3 bucket name (must be globally unique)"
  type        = string
  default     = "retail-inventory-insights-dev"
}

variable "tags" {
  description = "Optional extra tags"
  type        = map(string)
  default     = {}
}
