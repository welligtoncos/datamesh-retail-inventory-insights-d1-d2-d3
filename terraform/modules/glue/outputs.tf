output "carregar_origem_dia_job_name" {
  value       = aws_glue_job.carregar_origem_dia.name
  description = "Glue job name for carregar_origem_dia"
}

output "carregar_origem_dia_job_arn" {
  value       = aws_glue_job.carregar_origem_dia.arn
  description = "Glue job ARN"
}

output "glue_script_s3_uri" {
  value       = "s3://${var.bucket_name}/${local.origem_script_key}"
  description = "S3 URI of carregar_origem_dia script"
}

output "enriquecer_script_s3_uri" {
  value       = "s3://${var.bucket_name}/${local.enriquecer_script_key}"
  description = "S3 URI of enriquecer_dia script"
}

output "enriquecer_dia_job_name" {
  value       = aws_glue_job.enriquecer_dia.name
  description = "Glue job name for enriquecer_dia"
}

output "enriquecer_dia_job_arn" {
  value       = aws_glue_job.enriquecer_dia.arn
  description = "Glue job ARN for enriquecer_dia"
}
