output "bucket_name" {
  value       = module.s3.bucket_name
  description = "Data lake S3 bucket name"
}

output "bucket_arn" {
  value       = module.s3.bucket_arn
  description = "Data lake S3 bucket ARN"
}

output "insumo_prefix" {
  value       = module.s3.insumo_prefix
  description = "S3 prefix for CSV input"
}

output "origem_prefix" {
  value       = module.s3.origem_prefix
  description = "S3 prefix for origin parquet"
}

output "enriquecido_prefix" {
  value       = module.s3.enriquecido_prefix
  description = "S3 prefix for enriched parquet"
}

output "relatorios_prefix" {
  value       = module.s3.relatorios_prefix
  description = "S3 prefix for Excel reports"
}

output "glue_role_arn" {
  value       = module.iam.glue_role_arn
  description = "Glue ETL IAM role ARN"
}

output "lambda_reports_role_arn" {
  value       = module.iam.lambda_reports_role_arn
  description = "Lambda reports IAM role ARN"
}

output "sfn_role_arn" {
  value       = module.iam.sfn_role_arn
  description = "Step Functions IAM role ARN"
}

output "example_paths" {
  value = {
    insumo_csv     = "s3://${module.s3.bucket_name}/insumo/retail_store_inventory.csv"
    origem_dt      = "s3://${module.s3.bucket_name}/origem/dt=2022-01-01/data.parquet"
    enriquecido_dt = "s3://${module.s3.bucket_name}/enriquecido/dt=2022-01-01/data.parquet"
    relatorio_d1   = "s3://${module.s3.bucket_name}/relatorios/D1/relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx"
  }
  description = "Example S3 paths for analyst documentation (E1-US04)"
}

output "glue_carregar_origem_job_name" {
  value       = module.glue.carregar_origem_dia_job_name
  description = "Glue job: carregar_origem_dia (W2)"
}

output "glue_script_s3_uri" {
  value       = module.glue.glue_script_s3_uri
  description = "S3 URI of carregar_origem_dia script"
}

output "glue_enriquecer_job_name" {
  value       = module.glue.enriquecer_dia_job_name
  description = "Glue job: enriquecer_dia (W3)"
}

output "glue_enriquecer_script_s3_uri" {
  value       = module.glue.enriquecer_script_s3_uri
  description = "S3 URI of enriquecer_dia script"
}

output "sfn_processar_dia_arn" {
  value       = module.stepfunctions.processar_dia_state_machine_arn
  description = "Step Functions ARN: processar_dia (W4)"
}

output "sfn_processar_dia_name" {
  value       = module.stepfunctions.processar_dia_state_machine_name
  description = "Step Functions name: processar_dia (W4)"
}

output "sfn_log_group_name" {
  value       = module.stepfunctions.processar_dia_log_group_name
  description = "CloudWatch log group for processar_dia (E4-US03)"
}

output "lambda_gerar_relatorio_d1_name" {
  value       = module.lambda_reports.gerar_relatorio_d1_function_name
  description = "Lambda: gerar relatório Excel D-1 (W5)"
}

output "lambda_gerar_relatorio_d1_arn" {
  value       = module.lambda_reports.gerar_relatorio_d1_function_arn
  description = "Lambda ARN: gerar relatório D-1 (W5)"
}

output "lambda_gerar_relatorio_d2_name" {
  value       = module.lambda_reports.gerar_relatorio_d2_function_name
  description = "Lambda: gerar relatório Excel D-2 (W6)"
}

output "lambda_gerar_relatorio_d2_arn" {
  value       = module.lambda_reports.gerar_relatorio_d2_function_arn
  description = "Lambda ARN: gerar relatório D-2 (W6)"
}

output "lambda_gerar_relatorio_d3_name" {
  value       = module.lambda_reports.gerar_relatorio_d3_function_name
  description = "Lambda: gerar relatório Excel D-3 (W6)"
}

output "lambda_gerar_relatorio_d3_arn" {
  value       = module.lambda_reports.gerar_relatorio_d3_function_arn
  description = "Lambda ARN: gerar relatório D-3 (W6)"
}

output "athena_database_name" {
  value       = module.athena.glue_database_name
  description = "Glue/Athena database (E7-US01)"
}

output "athena_workgroup_name" {
  value       = module.athena.athena_workgroup_name
  description = "Athena workgroup (E7-US01)"
}

output "athena_example_query" {
  value       = module.athena.example_query
  description = "Example Athena SQL query"
}

output "sns_pipeline_alerts_topic_arn" {
  value       = module.monitoring.sns_topic_arn
  description = "SNS topic for SFN failure alerts (E7-US02)"
}

output "sfn_failed_alarm_name" {
  value       = module.monitoring.sfn_failed_alarm_name
  description = "CloudWatch alarm name for SFN failures (E7-US02)"
}
