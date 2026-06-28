output "glue_database_name" {
  value       = aws_glue_catalog_database.retail.name
  description = "Glue catalog database for Athena (E7-US01)"
}

output "enriquecido_table_name" {
  value       = aws_glue_catalog_table.enriquecido.name
  description = "Glue catalog table: enriquecido"
}

output "athena_workgroup_name" {
  value       = aws_athena_workgroup.retail.name
  description = "Athena workgroup name"
}

output "example_query" {
  value = <<-EOQ
    SELECT "Store ID", "Product ID", SUM("_lost") AS lost_total
    FROM ${aws_glue_catalog_database.retail.name}.${aws_glue_catalog_table.enriquecido.name}
    WHERE dt = '2022-01-01' AND "_stockout" = 1
    GROUP BY 1, 2
    ORDER BY lost_total DESC
    LIMIT 10;
  EOQ
  description = "Example Athena query — top rupturas do dia"
}
