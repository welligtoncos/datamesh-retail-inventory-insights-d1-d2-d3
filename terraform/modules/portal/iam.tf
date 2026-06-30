resource "aws_iam_role" "ecs_execution" {
  name = "${local.name_prefix}-ecs-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = local.default_tags
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  name = "${local.name_prefix}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = local.default_tags
}

data "aws_iam_policy_document" "ecs_task" {
  statement {
    sid    = "ReadDatameshPrefixes"
    effect = "Allow"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
    ]
    resources = [var.datamesh_bucket_arn]
    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values = [
        "insumo/*",
        "origem/*",
        "enriquecido/*",
        "relatorios/*",
        "athena-results/*",
      ]
    }
  }

  statement {
    sid    = "GetDatameshObjects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
    ]
    resources = [
      "${var.datamesh_bucket_arn}/insumo/*",
      "${var.datamesh_bucket_arn}/origem/*",
      "${var.datamesh_bucket_arn}/enriquecido/*",
      "${var.datamesh_bucket_arn}/relatorios/*",
    ]
  }

  statement {
    sid    = "AthenaResultsWrite"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = [
      var.datamesh_bucket_arn,
      "${var.datamesh_bucket_arn}/athena-results/*",
    ]
  }

  statement {
    sid    = "StartProcessarDia"
    effect = "Allow"
    actions = [
      "states:StartExecution",
      "states:DescribeExecution",
      "states:ListExecutions",
      "states:StopExecution",
    ]
    resources = [
      var.sfn_state_machine_arn,
      "${replace(var.sfn_state_machine_arn, ":stateMachine:", ":execution:")}:*",
    ]
  }

  statement {
    sid    = "AthenaQuery"
    effect = "Allow"
    actions = [
      "athena:StartQueryExecution",
      "athena:GetQueryExecution",
      "athena:GetQueryResults",
      "athena:StopQueryExecution",
      "athena:GetWorkGroup",
    ]
    resources = [
      "arn:aws:athena:${var.aws_region}:${var.aws_account_id}:workgroup/${var.athena_workgroup_name}",
    ]
  }

  statement {
    sid    = "GlueCatalogRead"
    effect = "Allow"
    actions = [
      "glue:GetDatabase",
      "glue:GetTable",
      "glue:GetPartitions",
    ]
    resources = [
      "arn:aws:glue:${var.aws_region}:${var.aws_account_id}:catalog",
      "arn:aws:glue:${var.aws_region}:${var.aws_account_id}:database/${var.athena_database_name}",
      "arn:aws:glue:${var.aws_region}:${var.aws_account_id}:table/${var.athena_database_name}/*",
    ]
  }

  statement {
    sid    = "DescribeSfnAlarm"
    effect = "Allow"
    actions = [
      "cloudwatch:DescribeAlarms",
    ]
    resources = ["*"]
  }
}

# Política gerenciada (evita limite de inline em roles e facilita reuso)
resource "aws_iam_policy" "ecs_task" {
  name        = "${local.name_prefix}-bff"
  description = "Portal BFF task role — datamesh read, SFN, Athena (E8-US01)"
  policy      = data.aws_iam_policy_document.ecs_task.json
  tags        = local.default_tags
}

resource "aws_iam_role_policy_attachment" "ecs_task" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.ecs_task.arn
}
