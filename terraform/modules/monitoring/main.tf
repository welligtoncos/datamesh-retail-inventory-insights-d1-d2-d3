variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "sfn_state_machine_arn" {
  type = string
}

variable "enable_sns_alerts" {
  description = "Create SNS topic for alarm actions (requires sns:CreateTopic)"
  type        = bool
  default     = false
}

variable "alert_email" {
  description = "Optional email for SNS subscription (dev); empty = topic only"
  type        = string
  default     = ""
}

locals {
  sfn_alarm_name = "${var.project_name}-processar-dia-failed-${var.environment}"
}

resource "aws_sns_topic" "pipeline_alerts" {
  count = var.enable_sns_alerts ? 1 : 0
  name  = "${var.project_name}-pipeline-alerts-${var.environment}"
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.enable_sns_alerts && var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.pipeline_alerts[0].arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# CloudWatch alarm: criado via scripts/ensure-sfn-alarm.ps1 (conta dev sem cloudwatch:ListTagsForResource no Terraform)
