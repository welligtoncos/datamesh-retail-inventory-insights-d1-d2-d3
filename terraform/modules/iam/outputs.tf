output "glue_role_arn" {
  description = "ARN of the Glue ETL execution role"
  value       = aws_iam_role.glue_etl.arn
}

output "glue_role_name" {
  description = "Name of the Glue ETL execution role"
  value       = aws_iam_role.glue_etl.name
}

output "lambda_reports_role_arn" {
  description = "ARN of the Lambda reports execution role"
  value       = aws_iam_role.lambda_reports.arn
}

output "lambda_reports_role_name" {
  description = "Name of the Lambda reports execution role"
  value       = aws_iam_role.lambda_reports.name
}

output "sfn_role_arn" {
  description = "ARN of the Step Functions orchestrator role"
  value       = aws_iam_role.step_functions.arn
}

output "sfn_role_name" {
  description = "Name of the Step Functions orchestrator role"
  value       = aws_iam_role.step_functions.name
}
