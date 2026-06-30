resource "aws_cognito_user_pool" "portal" {
  name = "${local.name_prefix}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 10
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = local.default_tags
}

resource "aws_cognito_user_pool_domain" "portal" {
  domain       = "${var.project_name}-portal-${var.environment}-${var.aws_account_id}"
  user_pool_id = aws_cognito_user_pool.portal.id
}

resource "aws_cognito_user_pool_client" "spa" {
  name         = "${local.name_prefix}-spa"
  user_pool_id = aws_cognito_user_pool.portal.id

  generate_secret                      = false
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  callback_urls = distinct(concat(
    var.additional_callback_urls,
    [local.cloudfront_callback_url]
  ))
  logout_urls = distinct(concat(
    [for u in var.additional_callback_urls : trimsuffix(u, "/")],
    [trimsuffix(local.cloudfront_callback_url, "/")]
  ))

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_group" "portal" {
  for_each = toset(local.cognito_groups)

  name         = each.value
  user_pool_id = aws_cognito_user_pool.portal.id
  description  = "Portal W7 persona group (RBAC enforcement fase 2)"
}
