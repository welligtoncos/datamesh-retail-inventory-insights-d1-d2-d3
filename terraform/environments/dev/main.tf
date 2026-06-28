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
  #   region = "us-east-1"
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

module "glue" {
  source = "../../modules/glue"

  project_name           = var.project_name
  environment            = var.environment
  bucket_name            = module.s3.bucket_name
  glue_role_arn          = module.iam.glue_role_arn
  script_path            = abspath("${path.module}/../../../glue/jobs/carregar_origem_dia.py")
  enriquecer_script_path = abspath("${path.module}/../../../glue/jobs/enriquecer_dia.py")
}

module "stepfunctions" {
  source = "../../modules/stepfunctions"

  project_name          = var.project_name
  environment           = var.environment
  sfn_role_arn          = module.iam.sfn_role_arn
  origem_job_name       = module.glue.carregar_origem_dia_job_name
  enriquecer_job_name   = module.glue.enriquecer_dia_job_name
  enable_eventbridge_schedule = var.enable_eventbridge_schedule
  eventbridge_rule_enabled    = var.eventbridge_rule_enabled
  enable_sfn_logging          = var.enable_sfn_logging
}

module "lambda_reports" {
  source = "../../modules/lambda_reports"

  project_name    = var.project_name
  environment     = var.environment
  bucket_name     = module.s3.bucket_name
  lambda_role_arn = module.iam.lambda_reports_role_arn
  package_path    = abspath("${path.module}/../../../lambda/build/lambda_reports.zip")
}

module "athena" {
  source = "../../modules/athena"

  project_name = var.project_name
  environment  = var.environment
  bucket_name  = module.s3.bucket_name
  aws_region   = var.aws_region
}

module "monitoring" {
  source = "../../modules/monitoring"

  project_name          = var.project_name
  environment           = var.environment
  sfn_state_machine_arn = module.stepfunctions.processar_dia_state_machine_arn
  alert_email           = var.alert_email
  enable_sns_alerts     = var.enable_sns_alerts
}
