output "processar_dia_state_machine_arn" {
  value       = aws_sfn_state_machine.processar_dia.arn
  description = "ARN da state machine processar_dia"
}

output "processar_dia_state_machine_name" {
  value       = aws_sfn_state_machine.processar_dia.name
  description = "Nome da state machine processar_dia"
}

output "processar_dia_log_group_name" {
  value       = var.enable_sfn_logging ? local.log_group_name : null
  description = "CloudWatch log group for Step Functions (E4-US03) when logging enabled"
}

output "eventbridge_rule_name" {
  value       = try(aws_cloudwatch_event_rule.processar_dia_daily[0].name, null)
  description = "EventBridge rule name when schedule enabled"
}
