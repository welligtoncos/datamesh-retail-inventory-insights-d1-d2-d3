variable "bucket_arn" {
  description = "ARN of the data lake S3 bucket"
  type        = string
}

variable "bucket_name" {
  description = "Name of the data lake S3 bucket"
  type        = string
}

variable "project_name" {
  description = "Project name for Glue/Lambda/SFN resource ARN patterns"
  type        = string
}

variable "role_name_prefix" {
  description = "Prefix for IAM role names (e.g. retail-inventory)"
  type        = string
  default     = "retail-inventory"
}

variable "environment" {
  description = "Environment suffix for IAM roles"
  type        = string
}

variable "aws_region" {
  description = "AWS region for scoped ARNs"
  type        = string
}

variable "aws_account_id" {
  description = "AWS account ID for scoped ARNs"
  type        = string
}

variable "tags" {
  description = "Tags applied to IAM roles"
  type        = map(string)
  default     = {}
}

locals {
  role_tags = var.tags

  bucket_objects_arn = "${var.bucket_arn}/*"
}

# --- Glue ETL role (W2/W3) ---

resource "aws_iam_role" "glue_etl" {
  name = "${var.role_name_prefix}-glue-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "glue.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = local.role_tags
}

resource "aws_iam_role_policy_attachment" "glue_service" {
  role       = aws_iam_role.glue_etl.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
}

data "aws_iam_policy_document" "glue_s3" {
  statement {
    sid    = "ListBucketScopedPrefixes"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
    ]
    resources = [var.bucket_arn]
    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values = [
        "insumo/*",
        "origem/*",
        "enriquecido/*",
        "glue/*",
      ]
    }
  }

  statement {
    sid    = "ReadInsumoOrigemEnriquecido"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
    ]
    resources = [
      "${var.bucket_arn}/insumo/*",
      "${var.bucket_arn}/origem/*",
      "${var.bucket_arn}/enriquecido/*",
      "${var.bucket_arn}/glue/*",
    ]
  }

  statement {
    sid    = "WriteOrigemEnriquecido"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = [
      "${var.bucket_arn}/origem/*",
      "${var.bucket_arn}/enriquecido/*",
    ]
  }
}

resource "aws_iam_role_policy" "glue_s3" {
  name   = "${var.project_name}-glue-s3-${var.environment}"
  role   = aws_iam_role.glue_etl.id
  policy = data.aws_iam_policy_document.glue_s3.json
}

# --- Lambda reports role (W5) ---

resource "aws_iam_role" "lambda_reports" {
  name = "${var.role_name_prefix}-lambda-reports-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = local.role_tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_reports.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "lambda_s3" {
  statement {
    sid    = "ListEnriquecidoRelatorios"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
    ]
    resources = [var.bucket_arn]
    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values = [
        "enriquecido/*",
        "relatorios/*",
      ]
    }
  }

  statement {
    sid    = "ReadEnriquecido"
    effect = "Allow"
    actions = [
      "s3:GetObject",
    ]
    resources = [
      "${var.bucket_arn}/enriquecido/*",
    ]
  }

  statement {
    sid    = "WriteRelatorios"
    effect = "Allow"
    actions = [
      "s3:PutObject",
    ]
    resources = [
      "${var.bucket_arn}/relatorios/*",
    ]
  }
}

resource "aws_iam_role_policy" "lambda_s3" {
  name   = "${var.project_name}-lambda-s3-${var.environment}"
  role   = aws_iam_role.lambda_reports.id
  policy = data.aws_iam_policy_document.lambda_s3.json
}

# --- Step Functions orchestrator role (W4) ---

resource "aws_iam_role" "step_functions" {
  name = "${var.role_name_prefix}-sfn-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "states.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = local.role_tags
}

data "aws_iam_policy_document" "sfn_orchestrator" {
  statement {
    sid    = "InvokeProjectGlueJobs"
    effect = "Allow"
    actions = [
      "glue:StartJobRun",
      "glue:GetJobRun",
      "glue:GetJobRuns",
      "glue:BatchStopJobRun",
    ]
    resources = [
      "arn:aws:glue:${var.aws_region}:${var.aws_account_id}:job/${var.project_name}-*",
    ]
  }

  statement {
    sid    = "InvokeProjectLambdaFunctions"
    effect = "Allow"
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [
      "arn:aws:lambda:${var.aws_region}:${var.aws_account_id}:function:${var.project_name}-*",
    ]
  }

  statement {
    sid    = "PassRoleToGlue"
    effect = "Allow"
    actions = [
      "iam:PassRole",
    ]
    resources = [aws_iam_role.glue_etl.arn]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["glue.amazonaws.com"]
    }
  }

  statement {
    sid    = "StepFunctionsExecutionLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/states/${var.project_name}-*",
      "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/states/${var.project_name}-*:*",
      "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/vendedlogs/states/${var.project_name}-*",
      "arn:aws:logs:${var.aws_region}:${var.aws_account_id}:log-group:/aws/vendedlogs/states/${var.project_name}-*:*",
    ]
  }
}

resource "aws_iam_role_policy" "sfn_orchestrator" {
  name   = "${var.project_name}-sfn-orchestrator-${var.environment}"
  role   = aws_iam_role.step_functions.id
  policy = data.aws_iam_policy_document.sfn_orchestrator.json
}
