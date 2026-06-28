variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "aws_region" {
  type = string
}

locals {
  database_name = replace("${var.project_name}_${var.environment}", "-", "_")
  table_name    = "enriquecido"
}

resource "aws_glue_catalog_database" "retail" {
  name        = local.database_name
  description = "Data lake retail inventory insights (${var.environment})"
}

resource "aws_glue_catalog_table" "enriquecido" {
  name          = local.table_name
  database_name = aws_glue_catalog_database.retail.name
  table_type    = "EXTERNAL_TABLE"

  parameters = {
    EXTERNAL                        = "TRUE"
    "parquet.compression"           = "SNAPPY"
    "projection.enabled"            = "true"
    "projection.dt.type"            = "date"
    "projection.dt.range"             = "2022-01-01,2024-12-31"
    "projection.dt.format"          = "yyyy-MM-dd"
    "storage.location.template"     = "s3://${var.bucket_name}/enriquecido/dt=$${dt}/"
  }

  storage_descriptor {
    location      = "s3://${var.bucket_name}/enriquecido/"
    input_format  = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat"

    ser_de_info {
      name                  = "ParquetSerDe"
      serialization_library = "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"
    }

    columns {
      name = "Date"
      type = "timestamp"
    }
    columns {
      name = "Store ID"
      type = "string"
    }
    columns {
      name = "Product ID"
      type = "string"
    }
    columns {
      name = "Category"
      type = "string"
    }
    columns {
      name = "Region"
      type = "string"
    }
    columns {
      name = "Inventory Level"
      type = "int"
    }
    columns {
      name = "Units Sold"
      type = "int"
    }
    columns {
      name = "Units Ordered"
      type = "int"
    }
    columns {
      name = "Demand Forecast"
      type = "double"
    }
    columns {
      name = "Price"
      type = "double"
    }
    columns {
      name = "Discount"
      type = "int"
    }
    columns {
      name = "Weather Condition"
      type = "string"
    }
    columns {
      name = "Holiday/Promotion"
      type = "int"
    }
    columns {
      name = "Competitor Pricing"
      type = "double"
    }
    columns {
      name = "Seasonality"
      type = "string"
    }
    columns {
      name = "_revenue"
      type = "double"
    }
    columns {
      name = "_stockout"
      type = "int"
    }
    columns {
      name = "_lost"
      type = "double"
    }
    columns {
      name = "_is_weekend"
      type = "int"
    }
  }

  partition_keys {
    name = "dt"
    type = "string"
  }
}

resource "aws_athena_workgroup" "retail" {
  name = "${var.project_name}-${var.environment}"

  configuration {
    enforce_workgroup_configuration    = true
    publish_cloudwatch_metrics_enabled = true

    result_configuration {
      output_location = "s3://${var.bucket_name}/athena-results/"
    }
  }
}
