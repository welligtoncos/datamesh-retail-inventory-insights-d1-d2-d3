# Logical Components · U1 Infra

| Componente lógico | Serviço AWS | Módulo Terraform |
|-------------------|-------------|------------------|
| DataLakeBucket | S3 | `modules/s3` |
| BucketEncryption | S3 SSE | `modules/s3` |
| BucketPublicAccessBlock | S3 | `modules/s3` |
| BucketTlsPolicy | S3 bucket policy | `modules/s3` |
| PrefixMarkers | S3 objects (.keep) | `modules/s3` |
| GlueExecutionRole | IAM | `modules/iam` |
| LambdaReportsRole | IAM | `modules/iam` |
| StepFunctionsRole | IAM | `modules/iam` |
| DevEnvironment | Root module | `environments/dev` |

## Boundaries

- **U1 owns**: bucket + IAM roles + Terraform
- **U1 does not own**: Glue jobs, Lambdas, state machines, CSV content (upload manual)

## Interfaces (outputs)

```
bucket_name, bucket_arn
insumo_prefix, origem_prefix, enriquecido_prefix, relatorios_prefix
glue_role_arn, lambda_reports_role_arn, sfn_role_arn
```
