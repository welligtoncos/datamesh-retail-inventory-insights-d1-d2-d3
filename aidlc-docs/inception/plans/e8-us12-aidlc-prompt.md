# Prompt AI-DLC · E8-US12 — FastAPI BFF e deploy E2E dev

Copie o bloco abaixo em um **novo chat Cursor** para iniciar a story no workflow AI-DLC.

---

```
using aidlc, siga o workflow AI-DLC na fase CONSTRUCTION para a unidade U8-Portal-API (BFF FastAPI) — story E8-US12 (FastAPI BFF e deploy E2E dev).

## Instrução de fase
- Executar APENAS Part 1 (design): application-design, functional-design, nfr-requirements, nfr-design, infrastructure-design, code-generation-plan Part 1 com checkboxes.
- NÃO gerar código em portal-api/ nem alterar Terraform/ECS até eu responder "Continue to Next Stage".
- Ao final da Part 1: apresentar resumo + opções "Request Changes" / "Continue to Next Stage".
- Seguir extensions habilitadas: Security Baseline, Resiliency Baseline, Property-Based Testing (aidlc-state.md).

## Story
- **ID:** E8-US12 · FastAPI BFF e deploy E2E dev
- **Persona:** P2 Engenheiro de dados
- **Como** engenheiro de dados, **quero** BFF FastAPI com todos os endpoints e portal deployado em dev, **para** demonstrar fluxo ponta a ponta: login → insight D-1 → download Excel.
- **Status atual:** backlog → marcar in_progress ao iniciar
- **Depende:** E8-US01…E8-US11 (todas done no projeto)
- **Commit base portal:** e79b9d2 (E8-US11 done — /enriquecido/athena, 9 templates Athena, 125 specs)
- **Commit base infra:** E8-US01 aplicado — ECS placeholder nginx, API GW + Cognito JWT, IAM task role pronta

## Contexto brownfield (AWS / datamesh)
- **Região / conta:** `us-east-1` · `303238378103`
- **Bucket dados:** `s3://retail-inventory-insights-dev-use1/`
  - `insumo/`, `origem/dt=`, `enriquecido/dt=`, `relatorios/D1|D2|D3/`, `athena-results/`
- **Glue database:** `retail_inventory_insights_dev` · tabela `enriquecido`
- **Athena workgroup:** `retail-inventory-insights-dev`
- **SFN:** `processar_dia` (ARN via Terraform output / variável dev)
- **Alarme CW:** SFN failure alarm (nome em `PRIMARY_SFN_ALARM_NAME` no frontend mock)
- **Portal dev já provisionado (E8-US01):**
  - CloudFront: `https://d3g8ihrhzv7hsx.cloudfront.net/`
  - API GW: `https://jvpw3k4mnf.execute-api.us-east-1.amazonaws.com`
  - Cognito pool: `us-east-1_yJLzwZgZE` · client `co18jsioudbvk36n8a4hdih4q`
  - ECS Fargate: cluster/service com imagem **placeholder** `nginx:alpine` na porta 80
- **Terraform:** `terraform/modules/portal/` (ecs.tf, api.tf, iam.tf, cognito.tf, frontend.tf)
- **Validação infra:** `scripts/w7-us01-validate.ps1`
- **Lambdas relatório (lógica de referência):** `lambda/reports/gerar_relatorio_d1.py`, `d2.py`, `d3.py`
- **Athena templates SQL:** `scripts/athena-validation-queries.md` + `.sql`
- **Diagrama:** `diagrams/09-portal-web.mmd`

## Partição de referência E2E (dt = 2022-01-01)
| Métrica | Esperado |
|---------|----------|
| linhas enriquecido | 100 |
| receita_total | 879026.03 |
| produtos distintos D-1 | 69 |
| total_unidades D-1 | 14484 |
| Excel D-1 S3 key | `relatorios/D1/relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx` |

Partições conhecidas: `2022-01-01`, `2022-01-02`.

## Estado atual do frontend (contratos a espelhar)
O Angular **já implementa** todos os clientes HTTP; hoje usa **mock fallback** em 404/erro. O BFF deve retornar JSON **idêntico** aos models em `portal-web/src/app/core/api/models/`.

| RF | Método | Path (relativo apiBaseUrl) | Service Angular | Auth |
|----|--------|---------------------------|-----------------|------|
| RF-API-01 | GET | `/health` | `health.service.ts` | Público |
| RF-API-02 | GET | `/insumos` | `insumos-api.service.ts` | JWT |
| RF-API-04 | GET | `/origem/partitions` | `origem-api.service.ts` | JWT |
| RF-API-05 | GET | `/origem/{dt}/preview?page=&page_size=` | `origem-api.service.ts` | JWT |
| RF-API-06 | GET | `/enriquecido/partitions` | `enriquecido-api.service.ts` | JWT |
| RF-API-07 | GET | `/enriquecido/{dt}/kpis` | `enriquecido-api.service.ts` | JWT |
| RF-API-07b | GET | `/enriquecido/{dt}/preview?page=&page_size=` | `enriquecido-api.service.ts` | JWT |
| RF-API-08 | GET | `/insights/d1?dt=` | `insights-d1-api.service.ts` | JWT |
| RF-API-09 | GET | `/insights/d2?dt=` | `insights-d2-api.service.ts` | JWT |
| RF-API-10 | GET | `/insights/d3?dt=&window=` | `insights-d3-api.service.ts` | JWT |
| RF-API-11 | GET | `/insights/d1/download?dt=` | `insights-d1-api.service.ts` | JWT |
| RF-API-11 | GET | `/insights/d2/download?dt=` | `insights-d2-api.service.ts` | JWT |
| RF-API-11 | GET | `/insights/d3/download?dt=` | `insights-d3-api.service.ts` | JWT |
| RF-API-12 | POST | `/pipeline/processar-dia` body `{dt}` | `pipeline-api.service.ts` | JWT |
| RF-API-13 | GET | `/pipeline/executions?limit=` | `pipeline-api.service.ts` | JWT |
| RF-API-13b | GET | `/pipeline/executions/{executionId}` | `pipeline-api.service.ts` | JWT |
| RF-API-14 | POST | `/athena/query-template` body `{template_id, params?}` | `athena-api.service.ts` | JWT |
| RF-API-15 | GET | `/ops/alarms` | `ops-alarms-api.service.ts` | JWT |

**Dev local:** `apiBaseUrl: '/api'` + `portal-web/proxy.conf.json` → API GW dev.  
**Produção:** `environment.production.ts` aponta direto ao API GW.

**Specs portal atuais:** 125 (não quebrar regressão frontend).

## Escopo IN (E8-US12)
1. **`portal-api/`** — FastAPI **Python 3.12**, OpenAPI em `/docs` e `/redoc` (NFR-W7-06)
2. Implementar **RF-API-01, 02, 04–15** (14 endpoints; ver tabela acima incluindo preview e execution detail)
3. **JWT:** API GW já valida Cognito; definir se BFF confia no proxy (sem re-validação) ou valida claims (documentar na Part 1)
4. **S3:** ListObjects partições; GetObject Parquet (pyarrow) para preview/KPIs/insights; presigned download Excel `relatorios/` TTL ≤ 15 min (NFR-W7-02)
5. **Insights D-1/D-2/D-3:** agregação sobre Parquet `enriquecido/dt=` — **paridade** com Lambdas W5/W6 e mocks Angular (`d1-aggregate.util.ts`, `d2-filter.util.ts`, `d3-trend.util.ts`)
6. **Athena RF-API-14:** whitelist `template_id` → SQL parametrizado; poll até 60s; cap 100 linhas + `truncated` (design E8-US11)
7. **SFN RF-API-12/13:** StartExecution + ListExecutions + DescribeExecution; formato ARN compatível com `buildSfnExecutionArn()` no frontend
8. **CloudWatch RF-API-15:** DescribeAlarms do alarme SFN
9. **Health RF-API-01:** `GET /health` → 200 texto simples (`ok`); rota pública no API GW (já existe `aws_apigatewayv2_route.health`)
10. **Container Docker** + push ECR; substituir placeholder ECS (porta alinhada ALB target 80)
11. **Terraform:** atualizar task definition / variável imagem FastAPI (mínimo diff em `terraform/modules/portal/ecs.tf`)
12. **CORS:** API GW já inclui CloudFront origin; BFF pode adicionar middleware CORS para dev local se necessário
13. **Deploy doc/script:** `docs/portal-deploy-dev.md` ou `scripts/w7-us12-deploy.ps1` + `scripts/w7-us12-validate.ps1`
14. **E2E manual checklist:** login Cognito → home → D-1 `dt=2022-01-01` → download Excel OK; demais módulos sem mock chip
15. Atualizar `stories.md`, `aidlc-state.md`, `audit.md`, README raiz/portal-api

## Escopo OUT
- **RF-API-03** upload insumo (fase 2 — Q7)
- Alterações funcionais no Angular (exceto remover mock fallback opcional ou ajustar env se necessário)
- RBAC Cognito groups (fase 2)
- Editor SQL Athena livre
- Novos recursos AWS além de ECR image + ECS task update (sem duplicar bucket/SFN/Glue)
- CI/CD completo (GitHub Actions) — apenas script/doc dev
- Multi-ambiente prod/staging

## Decisões de arquitetura (validar na Part 1)

| # | Decisão | Opções | Recomendação sugerida |
|---|---------|--------|----------------------|
| D1 | Estrutura código | Monólito routers vs camadas domain/infra | Routers por domínio + `services/` + `repositories/s3.py` |
| D2 | Insights agregação | Reimplementar Python vs portar lógica Lambda | Portar regras das Lambdas + testes PBT; ler Parquet com pyarrow |
| D3 | KPIs enriquecido | Parquet scan vs Athena | Parquet local scan (menor latência dev) |
| D4 | Athena templates | SQL em `.sql` files vs Python strings | Dict template_id → SQL parametrizado com bind seguro |
| D5 | Porta container | 8000 + ALB rewrite vs 80 direto | **80** (compatível ALB atual) ou 8000 + atualizar target group |
| D6 | Imagem ECS | ECR repo novo vs existente | ECR `portal-api-dev` no mesmo account |
| D7 | Config | Env vars vs SSM | Env vars Fargate (bucket, region, SFN ARN, workgroup, alarm name) |
| D8 | Erros API | Problem Details vs JSON simples | JSON `{detail, code}` PT-BR alinhado RF-M7-03 |
| D9 | Testes | pytest unit + integration mock boto3 | PBT em agregações puras; moto/localstack opcional |
| D10 | OpenAPI | Gerado FastAPI vs export estático | FastAPI auto + snapshot para contrato |

## Regras de negócio (BFF)
- `dt` sempre ISO `YYYY-MM-DD`; rejeitar formato inválido (400)
- Preview origem/enriquecido: `page_size` max **500** (NFR-W7-03); default 50
- Athena: timeout poll **60s**; max **100** linhas UI; rejeitar `template_id` desconhecido (400)
- Presigned URL Excel: TTL **900s** (15 min); `s3_key` + `filename` no response (ver `insights-*-mock.data.ts`)
- Pipeline: `dt` no body; idempotência não garantida (documentar)
- SFN execution ARN: formato `:execution:sm:name` (paridade fix E8-US10)
- Mensagens de erro em **PT-BR**

## Catálogo Athena (servidor — espelhar E8-US11)
IDs whitelist (9): `smoke_preview`, `partition_sanity`, `enriched_null_check`, `d1_top_products`, `d1_totals`, `d2_stockouts`, `d2_top_lost`, `d3_weekend_trend`, `multi_dt_coverage`.  
Fonte SQL: `scripts/athena-validation-queries.sql`.  
**Nunca** aceitar SQL do cliente.

## IAM task role (já provisionada — E8-US01)
Reutilizar `terraform/modules/portal/iam.tf`:
- S3 read datamesh prefixes + Put/Get athena-results
- SFN StartExecution, Describe, List
- Athena Start/GetQueryExecution/GetQueryResults
- Glue catalog read
- CloudWatch DescribeAlarms

## Rastreabilidade obrigatória
- RF-API-01..15 (exceto 03)
- NFR-W7-01 (segurança JWT + IAM least privilege)
- NFR-W7-02 (presigned TTL)
- NFR-W7-03 (timeouts, limites linhas)
- NFR-W7-04 (health ALB, retry boto3)
- NFR-W7-06 (OpenAPI + PBT agregações)
- Persona P2

## Artefatos esperados (Part 1)
- `aidlc-docs/construction/u8-portal-api/`
  - application-design.md
  - functional-design/functional-design.md
  - nfr-requirements/nfr-requirements.md
  - nfr-design/nfr-design.md
  - infrastructure-design/infrastructure-design.md
  - code-summary.md
- `aidlc-docs/construction/plans/u8-portal-api-code-generation-plan.md` (steps Part 2 com [ ])

## Part 2 (após aprovação — não executar agora)
- `portal-api/` scaffold: `app/main.py`, routers, services, models Pydantic, `Dockerfile`, `requirements.txt`, `pyproject.toml` ou `requirements-dev.txt`
- Testes pytest + PBT (`hypothesis`) em agregações D-1/D-2/D-3
- `scripts/w7-us12-deploy.ps1` (build image, push ECR, terraform apply task image)
- `scripts/w7-us12-validate.ps1` (pytest + smoke HTTP contra API GW ou ALB + checklist E2E)
- `docs/portal-deploy-dev.md`
- Commit `feat(portal-api): E8-US12 FastAPI BFF + ECS deploy dev`
- Opcional Part 2b: smoke E2E com portal CloudFront sem chip mock

## Checklist E2E manual (planejar validação Part 2)
- [ ] `GET /health` público → 200
- [ ] Login Cognito no CloudFront dev
- [ ] Home: KPIs reais (sem chip demonstração)
- [ ] `/insights/d1?dt=2022-01-01` → 69 produtos, líder, ranking
- [ ] Download D-1 Excel abre `.xlsx` válido do S3
- [ ] `/enriquecido`, `/origem`, `/insumos` dados reais
- [ ] `/operacoes` dispara SFN (ou valida permissão)
- [ ] `/enriquecido/athena` template `partition_sanity` via API real
- [ ] `/ops/alarms` estado alarme real
- [ ] OpenAPI `/docs` acessível (rede interna ou via ALB se exposto)

## Regressão obrigatória
- Contratos JSON compatíveis com models Angular existentes
- `portal-web` build + 125 specs sem alteração (ou mínima)
- Terraform plan sem destroy de recursos portal existentes
- Lambdas W5/W6 continuam gerando Excel independentemente

## Commits de referência
- E8-US11: e79b9d2 (Athena templates frontend)
- E8-US10: b5dcc5a (ops alarms + esteira home)
- E8-US01: e35c26c (portal infra Terraform)
- Design Athena: `aidlc-docs/construction/u8-portal-web/athena-templates/`
- Requirements: `aidlc-docs/inception/requirements/portal-requirements.md`
- Frontend utils agregação: `portal-web/src/app/core/api/d1-aggregate.util.ts`, `d2-filter.util.ts`, `d3-trend.util.ts`
```

---

## Notas para o chat

1. **Part 1 apenas** — aguarde "Continue to Next Stage" antes de criar `portal-api/`.
2. Se disco estiver cheio no ambiente, libere `portal-web/dist`, `.angular/cache` e `node_modules` antes da Part 2.
3. Para E2E local sem deploy ECS: `uvicorn` + proxy Angular; deploy ECS é critério de aceite da story.
4. Após E8-US12 done, W7 Portal Web (12 stories) fecha; próximo épico seria fase 2 (upload, RBAC).
