# Component Methods · U1 Infra S3/IAM

> Assinaturas de recursos Terraform e operações operacionais. Regras de negócio (`carregar_origem_dia`, etc.) permanecem no notebook até W2+.

---

## C1 · S3DataLake

### Recursos Terraform (planejados)

```
module.s3.aws_s3_bucket.main
  name: retail-inventory-insights-dev
  region: us-east-1

module.s3.aws_s3_bucket_public_access_block.main
  block_public_acls: true
  block_public_policy: true
  ignore_public_acls: true
  restrict_public_buckets: true

module.s3.aws_s3_bucket_server_side_encryption_configuration.main
  rule: AES256 (SSE-S3)

module.s3.aws_s3_bucket_versioning.main (optional dev)
  status: Disabled (default dev)
```

### Outputs

| Output | Tipo | Descrição |
|--------|------|-----------|
| `bucket_name` | string | Nome do bucket |
| `bucket_arn` | string | ARN para policies IAM |
| `insumo_prefix` | string | `insumo/` |
| `origem_prefix` | string | `origem/` |
| `enriquecido_prefix` | string | `enriquecido/` |
| `relatorios_prefix` | string | `relatorios/` |

### Operação manual · upload insumo (E1-US02)

```
aws s3 cp retail_store_inventory.csv \
  s3://retail-inventory-insights-dev/insumo/retail_store_inventory.csv \
  --region us-east-1
```

---

## C2 · IAMRoleSet

### aws_iam_role.glue_etl

| Atributo | Valor |
|----------|-------|
| **name** | `retail-inventory-glue-dev` |
| **assume_role_policy** | Service: `glue.amazonaws.com` |
| **managed_policy_attachment** | `AWSGlueServiceRole` (AWS managed) + inline S3 scoped |

**Inline policy actions (scoped):**
- `s3:GetObject`, `s3:ListBucket` → `insumo/*`, `origem/*`, `enriquecido/*`
- `s3:PutObject`, `s3:DeleteObject` → `origem/*`, `enriquecido/*`

### aws_iam_role.lambda_reports

| Atributo | Valor |
|----------|-------|
| **name** | `retail-inventory-lambda-reports-dev` |
| **assume_role_policy** | Service: `lambda.amazonaws.com` |
| **managed_policy_attachment** | `AWSLambdaBasicExecutionRole` |

**Inline policy actions (scoped):**
- `s3:GetObject`, `s3:ListBucket` → `enriquecido/*`
- `s3:PutObject` → `relatorios/*`

### aws_iam_role.step_functions_orchestrator

| Atributo | Valor |
|----------|-------|
| **name** | `retail-inventory-sfn-dev` |
| **assume_role_policy** | Service: `states.amazonaws.com` |

**Inline policy actions (preparatório):**
- `glue:StartJobRun`, `glue:GetJobRun` (resource scoped quando jobs existirem W2+)
- `lambda:InvokeFunction` (resource scoped quando Lambdas existirem W4+)
- `logs:*` → CloudWatch Logs do SFN

### Outputs

| Output | Tipo |
|--------|------|
| `glue_role_arn` | string |
| `lambda_role_arn` | string |
| `sfn_role_arn` | string |

---

## C3 · TerraformStack

### Variáveis de entrada

| Variable | Default | Descrição |
|----------|---------|-----------|
| `aws_region` | `us-east-1` | Região |
| `environment` | `dev` | Tag Environment |
| `project_name` | `retail-inventory-insights` | Tag Project |
| `bucket_name` | `retail-inventory-insights-dev` | Nome global único S3 |

### Comandos

```
terraform init
terraform plan -var-file=dev.tfvars
terraform apply -var-file=dev.tfvars
terraform output
```

---

## C4 · DataLayoutDocumentation

### deliverable_map_table()

Retorna tabela markdown local→S3 (já em `requirements.md`).

### example_paths(dt: "2022-01-01")

| Tipo | Path |
|------|------|
| Origem | `s3://retail-inventory-insights-dev/origem/dt=2022-01-01/data.parquet` |
| Enriquecido | `s3://retail-inventory-insights-dev/enriquecido/dt=2022-01-01/data.parquet` |
| Relatório D-1 (futuro) | `s3://retail-inventory-insights-dev/relatorios/D1/relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx` |

---

## Nota

Detalhamento de regras de negócio (`enriquecer_dia`, agregação D-1) permanece em Functional Design das unidades U2–U5 (Construction futuro).
