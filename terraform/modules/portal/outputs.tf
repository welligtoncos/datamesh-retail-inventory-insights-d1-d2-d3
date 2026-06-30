output "cognito_user_pool_id" {
  value       = aws_cognito_user_pool.portal.id
  description = "Cognito User Pool ID for Angular SPA (E8-US01)"
}

output "cognito_user_pool_arn" {
  value       = aws_cognito_user_pool.portal.arn
  description = "Cognito User Pool ARN"
}

output "cognito_client_id" {
  value       = aws_cognito_user_pool_client.spa.id
  description = "Cognito app client ID for SPA (E8-US01)"
}

output "cognito_domain" {
  value       = "https://${aws_cognito_user_pool_domain.portal.domain}.auth.${var.aws_region}.amazoncognito.com"
  description = "Cognito hosted UI base URL"
}

output "cognito_groups" {
  value       = local.cognito_groups
  description = "Prepared persona groups (RBAC fase 2)"
}

output "cloudfront_url" {
  value       = "https://${aws_cloudfront_distribution.portal.domain_name}"
  description = "Portal Angular static site URL (E8-US01)"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.portal.id
  description = "CloudFront distribution ID"
}

output "portal_web_bucket_name" {
  value       = aws_s3_bucket.portal_web.id
  description = "S3 bucket for portal-web static assets"
}

output "api_gateway_url" {
  value       = aws_apigatewayv2_stage.default.invoke_url
  description = "API Gateway HTTP invoke URL for BFF (E8-US01)"
}

output "api_gateway_id" {
  value       = aws_apigatewayv2_api.portal.id
  description = "API Gateway HTTP API ID"
}

output "alb_dns_name" {
  value       = aws_lb.portal.dns_name
  description = "ALB DNS for ECS placeholder / future FastAPI"
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.portal.name
  description = "ECS cluster name"
}

output "ecs_service_name" {
  value       = aws_ecs_service.portal.name
  description = "ECS service name"
}

output "ecs_task_role_arn" {
  value       = aws_iam_role.ecs_task.arn
  description = "IAM task role for BFF (least privilege datamesh)"
}

output "ecs_task_policy_arn" {
  value       = aws_iam_policy.ecs_task.arn
  description = "Managed policy ARN for BFF task role"
}

output "ecs_task_definition_arn" {
  value       = aws_ecs_task_definition.portal_placeholder.arn
  description = "Current placeholder task definition ARN"
}
