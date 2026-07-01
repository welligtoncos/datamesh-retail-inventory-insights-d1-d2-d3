variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
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
  default     = "retail-inventory-insights-dev-use1"
}

variable "tags" {
  description = "Optional extra tags"
  type        = map(string)
  default     = {}
}

variable "enable_eventbridge_schedule" {
  description = "W4: create EventBridge cron rule (disabled by default in dev)"
  type        = bool
  default     = false
}

variable "eventbridge_rule_enabled" {
  description = "W4: ENABLED state for EventBridge rule when schedule exists"
  type        = bool
  default     = false
}

variable "enable_sfn_logging" {
  description = "W4: CloudWatch Logs for SFN (requires logs:CreateLogGroup)"
  type        = bool
  default     = false
}

variable "alert_email" {
  description = "W6: optional email for SNS pipeline failure alerts (dev)"
  type        = string
  default     = ""
}

variable "enable_sns_alerts" {
  description = "W6: create SNS topic (requires sns:CreateTopic IAM permission)"
  type        = bool
  default     = false
}

variable "enable_portal" {
  description = "W7: provision portal infra (Cognito, CloudFront, ECS, API GW)"
  type        = bool
  default     = true
}

variable "portal_web_bucket_name" {
  description = "Optional override for portal static site bucket name"
  type        = string
  default     = ""
}

variable "portal_callback_urls" {
  description = "Extra Cognito callback URLs for Angular dev (localhost)"
  type        = list(string)
  default     = ["http://localhost:4200/"]
}

variable "enable_portal_logging" {
  description = "W7: CloudWatch logs for portal API GW + ECS (requires logs:CreateLogGroup)"
  type        = bool
  default     = false
}

variable "portal_api_image" {
  description = "ECR image URI for FastAPI BFF (E8-US12). Empty keeps nginx placeholder."
  type        = string
  default     = ""
}
