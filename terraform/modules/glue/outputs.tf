output "carregar_origem_dia_job_name" {
  value       = aws_glue_job.carregar_origem_dia.name
  description = "Glue job name for carregar_origem_dia"
}

output "carregar_origem_dia_job_arn" {
  value       = aws_glue_job.carregar_origem_dia.arn
  description = "Glue job ARN"
}

output "glue_script_s3_uri" {
  value       = "s3://${var.bucket_name}/${local.script_key}"
  description = "S3 URI of deployed Glue script"
}
