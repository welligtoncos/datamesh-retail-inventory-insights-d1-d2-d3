locals {
  # ALB/TG names max 32 chars — prefix curto
  name_prefix = "rii-portal-${var.environment}"

  portal_web_bucket = coalesce(
    var.portal_web_bucket_name,
    "${var.project_name}-portal-web-${var.environment}-use1"
  )

  default_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Component   = "portal"
    },
    var.tags
  )

  cognito_groups = ["TI", "Analista", "Gestor", "Diretoria"]

  cloudfront_callback_url = "https://${aws_cloudfront_distribution.portal.domain_name}/"
}
