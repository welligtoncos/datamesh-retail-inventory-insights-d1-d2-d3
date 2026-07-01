resource "aws_ecs_cluster" "portal" {
  name = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }

  tags = local.default_tags
}

resource "aws_cloudwatch_log_group" "ecs" {
  count             = var.enable_portal_logging ? 1 : 0
  name              = "/ecs/${local.name_prefix}"
  retention_in_days = 14
  tags              = local.default_tags
}

locals {
  portal_api_enabled   = var.portal_api_image != ""
  ecs_container_name   = local.portal_api_enabled ? "portal-api" : "bff-placeholder"
  ecs_container_image  = local.portal_api_enabled ? var.portal_api_image : var.placeholder_container_image
  ecs_container_environment = local.portal_api_enabled ? [
    { name = "AWS_REGION", value = var.aws_region },
    { name = "DATAMESH_BUCKET", value = var.datamesh_bucket_name },
    { name = "SFN_STATE_MACHINE_ARN", value = var.sfn_state_machine_arn },
    { name = "ATHENA_DATABASE", value = var.athena_database_name },
    { name = "ATHENA_WORKGROUP", value = var.athena_workgroup_name },
    { name = "SFN_ALARM_NAME", value = var.sfn_failed_alarm_name },
    { name = "LOG_LEVEL", value = "INFO" },
  ] : []

  ecs_container_definitions = jsonencode([
    merge(
      {
        name      = local.ecs_container_name
        image     = local.ecs_container_image
        essential = true
        portMappings = [
          {
            containerPort = 80
            hostPort      = 80
            protocol      = "tcp"
          }
        ]
        environment = local.ecs_container_environment
      },
      var.enable_portal_logging ? {
        logConfiguration = {
          logDriver = "awslogs"
          options = {
            awslogs-group         = aws_cloudwatch_log_group.ecs[0].name
            awslogs-region        = var.aws_region
            awslogs-stream-prefix = "ecs"
          }
        }
      } : {}
    )
  ])
}

resource "aws_ecs_task_definition" "portal_placeholder" {
  family                   = "${local.name_prefix}-bff"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.ecs_cpu
  memory                   = var.ecs_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn
  container_definitions    = local.ecs_container_definitions

  tags = local.default_tags
}

resource "aws_ecs_service" "portal" {
  name            = "${local.name_prefix}-service"
  cluster         = aws_ecs_cluster.portal.id
  task_definition = aws_ecs_task_definition.portal_placeholder.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.portal.arn
    container_name   = local.ecs_container_name
    container_port   = 80
  }

  depends_on = [aws_lb_listener.http]

  tags = local.default_tags
}
