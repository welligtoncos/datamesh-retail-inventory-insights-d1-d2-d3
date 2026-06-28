# Components · U1 Infra S3/IAM

**Unidade:** U1 — Fundação de dados (Onda W1)  
**Stories:** E1-US01, E1-US02, E1-US03, E1-US04

---

## C1 · S3DataLake

| Atributo | Valor |
|----------|-------|
| **Purpose** | Armazenamento objeto espelhando filesystem local do notebook |
| **Responsibilities** | Bucket dev; prefixos insumo/origem/enriquecido/relatorios; BPA; SSE-S3; tags |
| **Interface** | S3 API; paths documentados para P1/P2 |
| **AWS Resource** | `aws_s3_bucket.retail_inventory_insights_dev` |

### Prefixos

| Prefixo | Equivalente local | Consumidor futuro |
|---------|-------------------|-------------------|
| `insumo/` | `retail_store_inventory.csv` | Glue origem (W2) |
| `origem/dt=` | `tabela_origem/dt=` | Glue origem/enriquecimento |
| `enriquecido/dt=` | `tabela_enriquecida/dt=` | Glue, Lambda D-1 |
| `relatorios/D1/` | `relatorio_D1_*.xlsx` | Lambda D-1 (W5) |
| `relatorios/D2/` | (planejado) | Lambda D-2 (W6) |
| `relatorios/D3/` | (planejado) | Lambda D-3 (W6) |

---

## C2 · IAMRoleSet

| Atributo | Valor |
|----------|-------|
| **Purpose** | Least privilege preparatório para compute futuro |
| **Responsibilities** | 3 roles scoped por prefixo; trust policies corretas |
| **Interface** | IAM AssumeRole por serviço AWS |
| **AWS Resources** | `aws_iam_role.glue_etl`, `lambda_reports`, `step_functions_orchestrator` |

### Roles

| Role | Trust | S3 scope |
|------|-------|----------|
| `retail-inventory-glue-dev` | `glue.amazonaws.com` | Get insumo/; Get/Put origem/, enriquecido/ |
| `retail-inventory-lambda-reports-dev` | `lambda.amazonaws.com` | Get enriquecido/; Put relatorios/ |
| `retail-inventory-sfn-dev` | `states.amazonaws.com` | Invoke Glue/Lambda (policy preparatória) |

---

## C3 · TerraformStack

| Atributo | Valor |
|----------|-------|
| **Purpose** | IaC para provisionar C1 + C2 de forma repetível |
| **Responsibilities** | Modules, variables, outputs, backend config |
| **Interface** | CLI `terraform init/plan/apply` |
| **Location** | `terraform/environments/dev/` |

---

## C4 · DataLayoutDocumentation

| Atributo | Valor |
|----------|-------|
| **Purpose** | E1-US04 — mapa analista local→S3 |
| **Responsibilities** | Tabela paths; exemplos dt=; instrução upload CSV |
| **Interface** | Markdown em `aidlc-docs/` e README |
| **Location** | `aidlc-docs/inception/requirements/requirements.md` (seção mapeamento) + README |

---

## Componentes explicitamente FORA de U1

- Glue Job (U2/U3)
- Lambda Function (U5)
- Step Functions State Machine (U4)
- EventBridge Rule (U4)
- Athena/Glue Catalog (U6)
