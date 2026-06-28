# Terraform · U1 Fundação S3/IAM

Infraestrutura da **Onda W1** (E1-US01 a E1-US04) para a esteira `datamesh-retail-inventory-insights-d1-d2-d3`.

**Região:** sa-east-1 · **Ambiente:** dev · **Bucket:** `retail-inventory-insights-dev`

> Sem Glue, Lambda ou Step Functions nesta rodada — apenas bucket, prefixos e roles IAM preparatórias.

---

## Estrutura

```
terraform/
├── modules/s3/       # bucket, encryption, BPA, TLS policy, prefix markers
├── modules/iam/      # glue-dev, lambda-reports-dev, sfn-dev roles
└── environments/dev/ # root module
```

---

## Pré-requisitos

- [Terraform](https://www.terraform.io/downloads) >= 1.5
- [AWS CLI v2](https://aws.amazon.com/cli/)
- Credenciais AWS com permissão para S3 e IAM (ex.: `aws configure` ou profile)

---

## Deploy

```powershell
cd terraform/environments/dev
terraform init
terraform plan -var-file=dev.tfvars
terraform apply -var-file=dev.tfvars
terraform output
```

---

## Upload do insumo (E1-US02)

Após o `apply`, envie o CSV manualmente:

```powershell
aws s3 cp ../../../retail_store_inventory.csv `
  s3://retail-inventory-insights-dev/insumo/retail_store_inventory.csv `
  --region sa-east-1
```

Validar schema (15 colunas) localmente com o notebook §1 antes do upload.

---

## Mapa local → S3 (E1-US04)

| Notebook (local) | AWS S3 |
|------------------|--------|
| `retail_store_inventory.csv` | `s3://retail-inventory-insights-dev/insumo/retail_store_inventory.csv` |
| `tabela_origem/dt=2022-01-01/data.parquet` | `s3://retail-inventory-insights-dev/origem/dt=2022-01-01/data.parquet` |
| `tabela_enriquecida/dt=2022-01-01/data.parquet` | `s3://retail-inventory-insights-dev/enriquecido/dt=2022-01-01/data.parquet` |
| `relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx` | `s3://retail-inventory-insights-dev/relatorios/D1/relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx` |

Paths de exemplo também disponíveis via `terraform output example_paths`.

---

## Prefixos S3

| Prefixo | Uso |
|---------|-----|
| `insumo/` | CSV fonte (Kaggle) |
| `origem/dt=YYYY-MM-DD/` | Parquet origem (W2) |
| `enriquecido/dt=YYYY-MM-DD/` | Parquet enriquecido (W3) |
| `relatorios/D1/` | Excel D-1 (W5) |
| `relatorios/D2/` | Excel D-2 (W6) |
| `relatorios/D3/` | Excel D-3 (W6) |

Marcadores `.keep` criados pelo Terraform para visibilidade dos prefixos no console.

---

## IAM Roles (E1-US03)

| Role | Trust | S3 scope |
|------|-------|----------|
| `retail-inventory-glue-dev` | glue.amazonaws.com | Read insumo/; R/W origem/, enriquecido/ |
| `retail-inventory-lambda-reports-dev` | lambda.amazonaws.com | Read enriquecido/; Write relatorios/ |
| `retail-inventory-sfn-dev` | states.amazonaws.com | Invoke Glue/Lambda `retail-inventory-insights-*` (W4+) |

---

## Validação pós-deploy

```powershell
aws s3 ls s3://retail-inventory-insights-dev/ --recursive --region sa-east-1
aws iam get-role --role-name retail-inventory-glue-dev
aws iam get-role --role-name retail-inventory-lambda-reports-dev
aws iam get-role --role-name retail-inventory-sfn-dev
```

---

## Destroy (dev only)

```powershell
terraform destroy -var-file=dev.tfvars
```

Remove bucket (se vazio) e roles. Dados no S3 serão perdidos.
