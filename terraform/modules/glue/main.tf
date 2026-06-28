locals {
  origem_job_name     = "${var.project_name}-carregar-origem-dia-${var.environment}"
  origem_script_key   = "glue/scripts/carregar_origem_dia.py"
  origem_script_hash  = filemd5(var.script_path)
  enriquecer_job_name = "${var.project_name}-enriquecer-dia-${var.environment}"
  enriquecer_script_key  = "glue/scripts/enriquecer_dia.py"
  enriquecer_script_hash = filemd5(var.enriquecer_script_path)
}

resource "aws_s3_object" "glue_script" {
  bucket       = var.bucket_name
  key          = local.origem_script_key
  source       = var.script_path
  etag         = local.origem_script_hash
  content_type = "text/x-python"
}

resource "aws_s3_object" "enriquecer_script" {
  bucket       = var.bucket_name
  key          = local.enriquecer_script_key
  source       = var.enriquecer_script_path
  etag         = local.enriquecer_script_hash
  content_type = "text/x-python"
}

resource "aws_glue_job" "carregar_origem_dia" {
  name     = local.origem_job_name
  role_arn = var.glue_role_arn

  command {
    name            = "pythonshell"
    script_location = "s3://${var.bucket_name}/${local.origem_script_key}"
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

resource "aws_glue_job" "enriquecer_dia" {
  name     = local.enriquecer_job_name
  role_arn = var.glue_role_arn

  command {
    name            = "pythonshell"
    script_location = "s3://${var.bucket_name}/${local.enriquecer_script_key}"
    python_version  = var.glue_version
  }

  default_arguments = {
    "--job-language"              = "python"
    "--enable-metrics"            = "true"
    "--additional-python-modules" = "pandas==2.2.3,pyarrow==18.1.0,numpy"
    "--bucket_name"               = var.bucket_name
  }

  max_capacity = var.max_capacity

  execution_property {
    max_concurrent_runs = 2
  }

  depends_on = [aws_s3_object.enriquecer_script]
}
