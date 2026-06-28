output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.main.id
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.main.arn
}

output "insumo_prefix" {
  description = "Prefix for raw CSV input"
  value       = "insumo/"
}

output "origem_prefix" {
  description = "Prefix for daily origin parquet partitions"
  value       = "origem/"
}

output "enriquecido_prefix" {
  description = "Prefix for daily enriched parquet partitions"
  value       = "enriquecido/"
}

output "relatorios_prefix" {
  description = "Prefix for Excel reports"
  value       = "relatorios/"
}
