variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "sfn_role_arn" {
  description = "IAM role ARN for Step Functions execution"
  type        = string
}

variable "origem_job_name" {
  type = string
}

variable "enriquecer_job_name" {
  type = string
}

variable "enable_eventbridge_schedule" {
  description = "Create EventBridge schedule rule (disabled by default in dev)"
  type        = bool
  default     = false
}

variable "eventbridge_rule_enabled" {
  description = "When schedule exists, ENABLED or DISABLED state"
  type        = bool
  default     = false
}

variable "schedule_expression" {
  description = "EventBridge cron for daily trigger (dt still manual via input in dev)"
  type        = string
  default     = "cron(0 9 * * ? *)"
}

variable "enable_sfn_logging" {
  description = "CloudWatch Logs ALL for SFN (requires logs:CreateLogGroup on deployer)"
  type        = bool
  default     = false
}
