# Infrastructure Design · U1 Infra

## Deployment Environment

| Atributo | Valor |
|----------|-------|
| Provider | AWS |
| Region | us-east-1 |
| Environment | dev |
| Account | Caller identity (terraform data source) |

## Storage Infrastructure

| Recurso | Configuração |
|---------|--------------|
| S3 bucket | `retail-inventory-insights-dev` |
| Encryption | SSE-S3 AES256 |
| Versioning | Suspended |
| Public access | Blocked |
| Prefixes | insumo/, origem/, enriquecido/, relatorios/D1|D2|D3/ |

## Compute Infrastructure

**N/A W1** — roles preparadas sem recursos compute.

## Messaging Infrastructure

**N/A W1**

## Networking Infrastructure

**N/A W1** — S3 public endpoint via TLS; sem VPC endpoints em dev.

## Monitoring Infrastructure

**N/A W1** — CloudWatch Logs permissions na role SFN (preparatório W4).

## Shared Infrastructure

Bucket único compartilhado por todas as ondas futuras (U2–U6).

## Service Mapping

| Notebook local | AWS (U1) |
|----------------|----------|
| retail_store_inventory.csv | s3://…/insumo/ |
| tabela_origem/dt= | s3://…/origem/dt=/ |
| tabela_enriquecida/dt= | s3://…/enriquecido/dt=/ |
| relatorio_D1_*.xlsx | s3://…/relatorios/D1/ |

## Terraform Layout

```
terraform/
├── modules/
│   ├── s3/          # bucket, encryption, BPA, policy, prefix markers
│   └── iam/         # 3 roles + inline policies
└── environments/
    └── dev/         # root module, tfvars, outputs
```
