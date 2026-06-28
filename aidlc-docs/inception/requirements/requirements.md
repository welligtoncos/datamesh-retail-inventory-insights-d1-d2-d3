# Requirements · datamesh-retail-inventory-insights-d1-d2-d3

**Escopo desta rodada:** Onda W1 — Épico E1 (E1-US01 a E1-US04)  
**Fonte brownfield:** `Esteira_3Relatorios_D1_D2_D3.ipynb`  
**Data:** 2026-06-28

---

## Intent Analysis

| Campo | Valor |
|-------|-------|
| **User request** | Migrar fundação da esteira local para AWS (S3 + IAM), mantendo paridade de layout com notebook |
| **Request type** | Migration / Enhancement |
| **Scope estimate** | Single component (U1 Infra) dentro de transformação system-wide futura |
| **Complexity estimate** | Simple (W1 — buckets, prefixos, roles, documentação) |

---

## Contexto

Pipeline brownfield de estoque varejo que hoje roda em Jupyter com:
- Insumo CSV (15 colunas)
- Partições `tabela_origem/dt=` e `tabela_enriquecida/dt=`
- Relatório Excel D-1 implementado

A migração AWS segue ondas W1–W6. **Esta rodada entrega apenas W1** — fundação S3/IAM sem compute (Glue, Lambda, Step Functions).

---

## Decisões arquiteturais (W1)

| Decisão | Valor |
|---------|-------|
| Região AWS | **us-east-1** (N. Virginia) |
| IaC | **Terraform** (CDK Python = alternativa documentada) |
| Bucket | **retail-inventory-insights-dev-use1** (us-east-1; legado sa-east-1 sem permissão de delete) |
| Ambiente | **dev** |
| Compute | **Nenhum** nesta rodada |

> **Alteração de decisão (2026-06-28):** região migrada de `sa-east-1` para **`us-east-1`**. Bucket renomeado para **`retail-inventory-insights-dev-use1`** (bucket legado `retail-inventory-insights-dev` permanece em sa-east-1 — sem permissão de delete).

---

## Requisitos funcionais (W1)

### RF-W1-01 · Bucket e prefixos S3 (E1-US01)
- Criar bucket `retail-inventory-insights-dev-use1` em us-east-1.
- Prefixos obrigatórios:
  - `insumo/`
  - `origem/dt=YYYY-MM-DD/`
  - `enriquecido/dt=YYYY-MM-DD/`
  - `relatorios/D1/`, `relatorios/D2/`, `relatorios/D3/`
- Particionamento `dt=` idêntico ao notebook local.
- Bloqueio de acesso público habilitado.

### RF-W1-02 · Insumo no S3 (E1-US02)
- Documentar upload de `retail_store_inventory.csv` para `s3://retail-inventory-insights-dev/insumo/`.
- Validar contrato SCHEMA (15 colunas) antes de consumo (referência notebook §1).
- Volume esperado: ~73.100 linhas (referência execução local).

### RF-W1-03 · IAM least privilege (E1-US03)
- Roles preparadas (sem anexar a compute ainda):
  - **Glue role**: leitura `insumo/`; leitura/escrita `origem/`, `enriquecido/`
  - **Lambda role**: leitura `enriquecido/`; escrita `relatorios/`
  - **Step Functions role**: invocar Glue/Lambda da esteira (policy preparatória)
- Nenhuma policy com `"Action": "*"` em ações sensíveis (s3:DeleteObject, iam:*, etc.).

### RF-W1-04 · Mapa para analista (E1-US04)
- Tabela local → S3 publicada em `aidlc-docs` ou README.
- Exemplo de path completo para `dt=2022-01-01` e relatório D-1 futuro.

---

## Requisitos não funcionais (W1)

### NFR-W1-01 · Segurança
- Block Public Access em bucket.
- SSE-S3 (AES-256) default encryption.
- Tags: `Project=retail-inventory-insights`, `Environment=dev`, `ManagedBy=terraform`.

### NFR-W1-02 · Custo
- Bucket único dev; lifecycle não obrigatório em W1.
- Sem recursos compute = custo mínimo.

### NFR-W1-03 · Manutenibilidade
- Terraform modular (`infra/` ou `terraform/`).
- Outputs documentados (bucket name, ARNs das roles).

### NFR-W1-04 · Paridade brownfield
- Layout S3 espelha `tabela_origem/`, `tabela_enriquecida/`, CSV raiz e futuros relatórios.
- Nomenclatura de relatório preservada: `relatorio_D1_exec{DATA}_dado{DIA}.xlsx`.

---

## Fora de escopo (esta rodada)

- Glue Jobs (W2/W3)
- Lambda functions (W5)
- Step Functions / EventBridge (W4)
- Athena / alarmes (W6)
- Relatórios D-2/D-3 Excel (W6)

---

## Mapeamento local → S3 (referência)

| Local | S3 (dev) |
|-------|----------|
| `retail_store_inventory.csv` | `s3://retail-inventory-insights-dev/insumo/retail_store_inventory.csv` |
| `tabela_origem/dt=2022-01-01/data.parquet` | `s3://retail-inventory-insights-dev/origem/dt=2022-01-01/data.parquet` |
| `tabela_enriquecida/dt=2022-01-01/data.parquet` | `s3://retail-inventory-insights-dev/enriquecido/dt=2022-01-01/data.parquet` |
| `relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx` | `s3://retail-inventory-insights-dev/relatorios/D1/relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx` |

---

## Rastreabilidade

| Story | Requisito |
|-------|-----------|
| E1-US01 | RF-W1-01, NFR-W1-01 |
| E1-US02 | RF-W1-02 |
| E1-US03 | RF-W1-03, NFR-W1-01 |
| E1-US04 | RF-W1-04 |

---

## Extension Configuration

| Extension | Enabled | Rationale |
|-----------|---------|-----------|
| Security Baseline | Yes | IAM/S3 least privilege central em W1 |
| Resiliency Baseline | No | Dev infra-only; aplicar W4+ |
| Property-Based Testing | No | Sem lógica de negócio em W1 |

---

## Critérios de sucesso W1

1. Bucket e prefixos provisionados via Terraform em us-east-1.
2. CSV de insumo acessível em `insumo/` (upload manual documentado).
3. Roles IAM criadas com policies scoped por prefixo.
4. Documentação de mapeamento local→S3 disponível para P1 e P2.
