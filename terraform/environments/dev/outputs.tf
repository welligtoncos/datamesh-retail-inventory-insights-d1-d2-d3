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
