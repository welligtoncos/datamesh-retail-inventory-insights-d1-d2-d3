terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Dev: state local. Para team/shared state, descomente e configure:
  # backend "s3" {
  #   bucket = "retail-inventory-insights-terraform-state"
  #   key    = "dev/u1-infra/terraform.tfstate"
  #   region = "sa-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}

module "s3" {
  source = "../../modules/s3"

  bucket_name  = var.bucket_name
  project_name = var.project_name
  environment  = var.environment
  tags         = var.tags
}

module "iam" {
  source = "../../modules/iam"

  bucket_arn     = module.s3.bucket_arn
  bucket_name    = module.s3.bucket_name
  project_name   = var.project_name
  environment    = var.environment
  aws_region     = var.aws_region
  aws_account_id = data.aws_caller_identity.current.account_id
  tags           = var.tags
}
