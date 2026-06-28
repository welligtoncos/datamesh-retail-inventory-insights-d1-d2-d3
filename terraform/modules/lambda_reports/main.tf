variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "lambda_role_arn" {
  type = string
}

variable "package_path" {
  description = "Path to gerar_relatorio_d1.zip (built by scripts/build_lambda_d1_package.ps1)"
  type        = string
}

variable "lambda_runtime" {
  type    = string
  default = "python3.12"
}

variable "lambda_timeout" {
  type    = number
  default = 120
}

variable "lambda_memory" {
  type    = number
  default = 512
}

locals {
  function_name = "${var.project_name}-gerar-relatorio-d1-${var.environment}"
  package_hash  = filemd5(var.package_path)
  s3_key        = "lambda/packages/gerar_relatorio_d1-${local.package_hash}.zip"
}

resource "aws_s3_object" "lambda_package" {
  bucket = var.bucket_name
  key    = local.s3_key
  source = var.package_path
  etag   = local.package_hash
}

resource "aws_lambda_function" "gerar_relatorio_d1" {
  function_name = local.function_name
  role          = var.lambda_role_arn
  handler       = "gerar_relatorio_d1.handler"
  runtime       = var.lambda_runtime
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory

  s3_bucket = var.bucket_name
  s3_key    = aws_s3_object.lambda_package.key

  environment {
    variables = {
      BUCKET_NAME = var.bucket_name
    }
  }

  depends_on = [aws_s3_object.lambda_package]
}
