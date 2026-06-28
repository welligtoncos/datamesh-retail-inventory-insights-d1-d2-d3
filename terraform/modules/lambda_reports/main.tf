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
  description = "Path to lambda_reports.zip (scripts/build_lambda_reports_package.ps1)"
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
  d1_function_name = "${var.project_name}-gerar-relatorio-d1-${var.environment}"
  d2_function_name = "${var.project_name}-gerar-relatorio-d2-${var.environment}"
  d3_function_name = "${var.project_name}-gerar-relatorio-d3-${var.environment}"
  package_hash     = filemd5(var.package_path)
  s3_key           = "lambda/packages/lambda_reports-${local.package_hash}.zip"
}

resource "aws_s3_object" "lambda_package" {
  bucket = var.bucket_name
  key    = local.s3_key
  source = var.package_path
  etag   = local.package_hash
}

resource "aws_lambda_function" "gerar_relatorio_d1" {
  function_name = local.d1_function_name
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

resource "aws_lambda_function" "gerar_relatorio_d2" {
  function_name = local.d2_function_name
  role          = var.lambda_role_arn
  handler       = "gerar_relatorio_d2.handler"
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

resource "aws_lambda_function" "gerar_relatorio_d3" {
  function_name = local.d3_function_name
  role          = var.lambda_role_arn
  handler       = "gerar_relatorio_d3.handler"
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
