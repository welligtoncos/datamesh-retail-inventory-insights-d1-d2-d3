locals {
  state_machine_name = "${var.project_name}-processar-dia-${var.environment}"
  log_group_name     = "/aws/states/${local.state_machine_name}"
}

resource "aws_cloudwatch_log_group" "sfn" {
  count             = var.enable_sfn_logging ? 1 : 0
  name              = local.log_group_name
  retention_in_days = 14
}

data "aws_caller_identity" "current" {}

resource "aws_cloudwatch_log_resource_policy" "sfn" {
  count       = var.enable_sfn_logging ? 1 : 0
  policy_name = "${var.project_name}-sfn-logs-${var.environment}"

  policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "delivery.logs.amazonaws.com"
      }
      Action = [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
      ]
      Resource = "${aws_cloudwatch_log_group.sfn[0].arn}:*"
      Condition = {
        StringEquals = {
          "aws:SourceAccount" = data.aws_caller_identity.current.account_id
        }
        ArnLike = {
          "aws:SourceArn" = "arn:aws:states:*:${data.aws_caller_identity.current.account_id}:stateMachine:*"
        }
      }
    }]
  })
}

resource "aws_sfn_state_machine" "processar_dia" {
  name     = local.state_machine_name
  role_arn = var.sfn_role_arn

  definition = templatefile("${path.module}/processar_dia.asl.json.tpl", {
    origem_job_name     = var.origem_job_name
    enriquecer_job_name = var.enriquecer_job_name
  })

  dynamic "logging_configuration" {
    for_each = var.enable_sfn_logging ? [1] : []
    content {
      level                  = "ALL"
      include_execution_data = true
      log_destination        = "${aws_cloudwatch_log_group.sfn[0].arn}:*"
    }
  }

  depends_on = [aws_cloudwatch_log_resource_policy.sfn]
}

resource "aws_iam_role" "eventbridge_sfn" {
  count = var.enable_eventbridge_schedule ? 1 : 0
  name  = "${var.project_name}-eventbridge-sfn-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "events.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_start_sfn" {
  count = var.enable_eventbridge_schedule ? 1 : 0
  name  = "${var.project_name}-eventbridge-start-sfn-${var.environment}"
  role  = aws_iam_role.eventbridge_sfn[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "states:StartExecution"
      Resource = aws_sfn_state_machine.processar_dia.arn
    }]
  })
}

resource "aws_cloudwatch_event_rule" "processar_dia_daily" {
  count               = var.enable_eventbridge_schedule ? 1 : 0
  name                = "${var.project_name}-processar-dia-daily-${var.environment}"
  description         = "Agendamento opcional processar_dia (dev: preferir execucao manual com dt explicito)"
  schedule_expression = var.schedule_expression
  state               = var.eventbridge_rule_enabled ? "ENABLED" : "DISABLED"
}

resource "aws_cloudwatch_event_target" "processar_dia_sfn" {
  count     = var.enable_eventbridge_schedule ? 1 : 0
  rule      = aws_cloudwatch_event_rule.processar_dia_daily[0].name
  target_id = "ProcessarDiaStepFunctions"
  arn       = aws_sfn_state_machine.processar_dia.arn
  role_arn  = aws_iam_role.eventbridge_sfn[0].arn

  input = jsonencode({
    dt = "REQUIRES_MANUAL_DT_OR_LAMBDA"
  })
}
