locals {
  job_name    = "${var.project_name}-carregar-origem-dia-${var.environment}"
  script_key  = "glue/scripts/carregar_origem_dia.py"
  script_hash = filemd5(var.script_path)
}

resource "aws_s3_object" "glue_script" {
  bucket       = var.bucket_name
  key          = local.script_key
  source       = var.script_path
  etag         = local.script_hash
  content_type = "text/x-python"
}

resource "aws_glue_job" "carregar_origem_dia" {
  name     = local.job_name
  role_arn = var.glue_role_arn

  command {
    name            = "pythonshell"
    script_location = "s3://${var.bucket_name}/${local.script_key}"
    python_version  = var.glue_version
  }

  default_arguments = {
    "--job-language"              = "python"
    "--enable-metrics"            = "true"
    "--additional-python-modules" = "pandas==2.2.3,pyarrow==18.1.0"
    "--bucket_name"               = var.bucket_name
  }

  max_capacity = var.max_capacity

  execution_property {
    max_concurrent_runs = 2
  }

  depends_on = [aws_s3_object.glue_script]
}
