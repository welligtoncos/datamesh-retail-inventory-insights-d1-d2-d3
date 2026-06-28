output "gerar_relatorio_d1_function_name" {
  value       = aws_lambda_function.gerar_relatorio_d1.function_name
  description = "Lambda: gerar relatório Excel D-1 (W5)"
}

output "gerar_relatorio_d1_function_arn" {
  value       = aws_lambda_function.gerar_relatorio_d1.arn
  description = "Lambda ARN: gerar relatório D-1"
}

output "gerar_relatorio_d1_invoke_arn" {
  value       = aws_lambda_function.gerar_relatorio_d1.invoke_arn
  description = "Lambda invoke ARN"
}
