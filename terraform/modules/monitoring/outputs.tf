output "sns_topic_arn" {
  value       = try(aws_sns_topic.pipeline_alerts[0].arn, null)
  description = "SNS topic for pipeline failure alerts (E7-US02) when enable_sns_alerts"
}

output "sns_topic_name" {
  value       = try(aws_sns_topic.pipeline_alerts[0].name, null)
  description = "SNS topic name"
}

output "sfn_failed_alarm_name" {
  value       = local.sfn_alarm_name
  description = "CloudWatch alarm name (criado via scripts/ensure-sfn-alarm.ps1)"
}
