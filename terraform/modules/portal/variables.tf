variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment suffix (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID for scoped IAM ARNs"
  type        = string
}

variable "datamesh_bucket_name" {
  description = "Existing data lake S3 bucket name (W1)"
  type        = string
}

variable "datamesh_bucket_arn" {
  description = "Existing data lake S3 bucket ARN (W1)"
  type        = string
}

variable "sfn_state_machine_arn" {
  description = "Step Functions processar_dia state machine ARN (W4)"
  type        = string
}

variable "athena_workgroup_name" {
  description = "Athena workgroup name (W6)"
  type        = string
}

variable "athena_database_name" {
  description = "Glue/Athena database name for enriquecido (W6)"
  type        = string
}

variable "sfn_failed_alarm_name" {
  description = "CloudWatch alarm name for SFN failures (W6)"
  type        = string
}

variable "portal_web_bucket_name" {
  description = "Globally unique S3 bucket for Angular static site"
  type        = string
  default     = ""
}

variable "additional_callback_urls" {
  description = "Extra Cognito callback URLs (e.g. http://localhost:4200/)"
  type        = list(string)
  default     = ["http://localhost:4200/"]
}

variable "ecs_cpu" {
  description = "Fargate task CPU units (dev minimum 256)"
  type        = number
  default     = 256
}

variable "ecs_memory" {
  description = "Fargate task memory MiB (dev minimum 512)"
  type        = number
  default     = 512
}

variable "placeholder_container_image" {
  description = "ECS placeholder image until FastAPI (E8-US12)"
  type        = string
  default     = "public.ecr.aws/docker/library/nginx:alpine"
}

variable "tags" {
  description = "Additional resource tags"
  type        = map(string)
  default     = {}
}

variable "enable_portal_logging" {
  description = "Create CloudWatch log groups for API GW and ECS (requires logs:CreateLogGroup)"
  type        = bool
  default     = false
}
