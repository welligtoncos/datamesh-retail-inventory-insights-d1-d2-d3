resource "aws_apigatewayv2_api" "portal" {
  name          = "${local.name_prefix}-http"
  protocol_type = "HTTP"
  description   = "Portal BFF API (E8-US01 placeholder → FastAPI E8-US12)"

  cors_configuration {
    allow_origins = distinct(concat(
      var.additional_callback_urls,
      [local.cloudfront_callback_url]
    ))
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["authorization", "content-type"]
    max_age       = 300
  }

  tags = local.default_tags
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.portal.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${local.name_prefix}-cognito"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.spa.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.portal.id}"
  }
}

resource "aws_apigatewayv2_integration" "alb" {
  api_id                 = aws_apigatewayv2_api.portal.id
  integration_type       = "HTTP_PROXY"
  integration_method     = "ANY"
  # HTTP API + INTERNET: URI must be http(s) URL, not listener ARN (ARN requires VPC_LINK).
  integration_uri        = "http://${aws_lb.portal.dns_name}"
  connection_type        = "INTERNET"
  payload_format_version = "1.0"

  depends_on = [aws_lb_listener.http]
}

resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.portal.id
  route_key = "GET /health"
  target    = "integrations/${aws_apigatewayv2_integration.alb.id}"
}

resource "aws_apigatewayv2_route" "default" {
  api_id             = aws_apigatewayv2_api.portal.id
  route_key          = "$default"
  target             = "integrations/${aws_apigatewayv2_integration.alb.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_cloudwatch_log_group" "api_gw" {
  count             = var.enable_portal_logging ? 1 : 0
  name              = "/aws/apigateway/${local.name_prefix}"
  retention_in_days = 14
  tags              = local.default_tags
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.portal.id
  name        = "$default"
  auto_deploy = true

  dynamic "access_log_settings" {
    for_each = var.enable_portal_logging ? [1] : []
    content {
      destination_arn = aws_cloudwatch_log_group.api_gw[0].arn
      format = jsonencode({
        requestId      = "$context.requestId"
        ip             = "$context.identity.sourceIp"
        requestTime    = "$context.requestTime"
        httpMethod     = "$context.httpMethod"
        routeKey       = "$context.routeKey"
        status         = "$context.status"
        protocol       = "$context.protocol"
        responseLength = "$context.responseLength"
      })
    }
  }

  tags = local.default_tags
}
