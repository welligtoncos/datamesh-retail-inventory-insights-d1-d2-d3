resource "aws_s3_bucket" "portal_web" {
  bucket = local.portal_web_bucket
  tags   = local.default_tags
}

resource "aws_s3_bucket_public_access_block" "portal_web" {
  bucket = aws_s3_bucket.portal_web.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "portal_web" {
  bucket = aws_s3_bucket.portal_web.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_versioning" "portal_web" {
  bucket = aws_s3_bucket.portal_web.id

  versioning_configuration {
    status = "Suspended"
  }
}

resource "aws_cloudfront_origin_access_control" "portal_web" {
  name                              = "${local.name_prefix}-oac"
  description                       = "OAC for portal Angular static site"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_object" "portal_placeholder" {
  bucket       = aws_s3_bucket.portal_web.id
  key          = "index.html"
  content_type = "text/html; charset=utf-8"
  content      = <<-HTML
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="utf-8"><title>Portal Datamesh</title></head>
    <body><h1>Portal Datamesh · W7</h1><p>Placeholder E8-US01 — deploy Angular em E8-US02+.</p></body>
    </html>
  HTML
  tags = local.default_tags
}

resource "aws_cloudfront_distribution" "portal" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${local.name_prefix} Angular SPA"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name              = aws_s3_bucket.portal_web.bucket_regional_domain_name
    origin_id                = "portal-web-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.portal_web.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "portal-web-s3"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = local.default_tags
}

data "aws_iam_policy_document" "portal_web_bucket" {
  statement {
    sid    = "DenyInsecureTransport"
    effect = "Deny"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = ["s3:*"]
    resources = [aws_s3_bucket.portal_web.arn, "${aws_s3_bucket.portal_web.arn}/*"]

    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }

  statement {
    sid    = "AllowCloudFrontServicePrincipal"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.portal_web.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.portal.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "portal_web" {
  bucket = aws_s3_bucket.portal_web.id
  policy = data.aws_iam_policy_document.portal_web_bucket.json

  depends_on = [aws_s3_bucket_public_access_block.portal_web]
}
