# AI-DLC State

## Projeto
- **Nome:** datamesh-retail-inventory-insights-d1-d2-d3
- **Escopo atual:** W1–W6 concluídas · **W7 Portal Web** em INCEPTION (Requirements Analysis)
- **Referência brownfield:** `Esteira_3Relatorios_D1_D2_D3.ipynb`, `PROJETO_DATAMESH.txt`, `diagrams/09-portal-web.mmd`

## Project Information
- **Project Type**: Brownfield
- **Start Date**: 2026-06-24
- **Current Stage**: CONSTRUCTION — U8 Portal Infra (E8-US01)

## Decisões confirmadas
- [x] Região AWS: **us-east-1** (N. Virginia)
- [x] IaC: **Terraform**
- [x] Bucket: **retail-inventory-insights-dev-use1** (us-east-1; legado sa-east-1: `retail-inventory-insights-dev`)
- [x] Ambiente: **dev**
- [x] AWS Account: **303238378103**
- [x] Entrega Excel W5–W6: S3 apenas (default)
- [ ] Cron EventBridge: manual em dev (W4)
- [ ] SNS alertas: desabilitado em dev (sem IAM sns:CreateTopic)

## Stage Progress

### INCEPTION PHASE
- [x] Workspace Detection (W1–W6)
- [x] Reverse Engineering (brownfield notebook)
- [x] Requirements Analysis (W1–W6)
- [x] **Requirements Analysis (W7 Portal)** — `portal-requirements.md` aprovado 2026-06-29
- [x] **User Stories (W7)** — E8-US01…12 geradas 2026-06-29
- [ ] Workflow Planning (W7)
- [ ] Application Design (W7)

### CONSTRUCTION PHASE — W1–W6 complete
- [x] U1 Infra S3/IAM — **deployed & validated** 2026-06-28
- [x] U2 Origem Glue — **deployed & validated** 2026-06-28
- [x] U3 Enriquecido Glue — **deployed & validated** 2026-06-28
- [x] U4 Orquestração SFN — **deployed & validated** 2026-06-28
- [x] U5 Relatório D-1 Lambda — **deployed & validated** 2026-06-28
- [x] U6 D-2/D-3 Lambda — **deployed & validated** 2026-06-28
- [x] U7 Athena + Alarmes — **deployed & validated** 2026-06-28
- [ ] **U8 Portal Infra (E8-US01)** — Terraform gerado; apply via `w7-us01-validate.ps1`

### OPERATIONS PHASE
- [ ] Operations — PLACEHOLDER

## Entrega por onda
| Onda | Épico | Stories | Status entrega |
|------|-------|---------|----------------|
| W1 | E1 Fundação | 4 | **done** |
| W2 | E2 Origem | 3 | **done** |
| W3 | E3 Enriquecimento | 3 | **done** |
| W4 | E4 Orquestração | 3 | **done** |
| W5 | E5 Relatório D-1 | 3 | **done** |
| W6 | E6 + E7 D-2/D-3/Ops | 4 | **done** |
| W7 | E8 Portal Web | 12 | **inception** — stories ready |

## W7 Portal Web
- **Frontend:** Angular + Angular Material · S3 + CloudFront
- **Backend:** FastAPI Python 3.12 · API Gateway + ECS Fargate
- **Auth:** Cognito (RBAC persona = fase 2)
- **Escopo W7:** M1–M5 completo exceto upload insumo (lista only)
- **Requirements:** `aidlc-docs/inception/requirements/portal-requirements.md`

## Extension Configuration (W7)
| Extension | Enabled | Decided At |
|-----------|---------|------------|
| Security Baseline | **Yes** | Q16 — Requirements Analysis W7 |
| Resiliency Baseline | **Yes** | Q17 — Requirements Analysis W7 |
| Property-Based Testing | **Yes** | Q18 — Requirements Analysis W7 |

## Current Status
- **Lifecycle Phase**: INCEPTION — W7 Portal Web
- **Next Stage**: `terraform apply` E8-US01 → E8-US02 (Angular Cognito)
- **Status W1–W6**: Lambdas D-1/D-2/D-3; Athena; alarme SFN OK

## Última atualização
- 2026-06-29 — E8-US01: módulo terraform/modules/portal + w7-us01-validate.ps1
