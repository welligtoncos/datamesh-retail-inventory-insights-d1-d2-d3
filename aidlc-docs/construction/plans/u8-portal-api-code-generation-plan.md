# Code Generation Plan · U8 Portal API (BFF FastAPI)

**Stories:** E8-US12  
**Unit:** U8-Portal-API  
**Status:** Part 1 concluído — aguardando aprovação  
**Data:** 2026-07-01

---

## Unit Context

- Brownfield: portal Angular E8-US01…US11 done (125 specs); ECS placeholder nginx
- Design: `aidlc-docs/construction/u8-portal-api/`
- Contratos: `portal-web/src/app/core/api/models/*.ts`
- Lambdas referência: `lambda/reports/gerar_relatorio_*.py`
- Commit base: `e79b9d2` (E8-US11)

---

## Steps (Part 2 — após aprovação)

- [ ] Step 1: Scaffold `portal-api/` — `main.py`, `config.py`, `logging.py`, `Dockerfile`, `requirements.txt`
- [ ] Step 2: Pydantic schemas espelhando models Angular (health, insumo, origem, enriquecido)
- [ ] Step 3: Repositories S3 — partitions, parquet read, presign
- [ ] Step 4: Domain puro — `dates.py`, `d1_aggregate.py`, `d2_filter.py`, `d3_trend.py`, `enriquecido_kpis.py`
- [ ] Step 5: Routers + services — insumos, origem, enriquecido (RF-API-02, 04–07)
- [ ] Step 6: Routers + services — insights d1/d2/d3 + download (RF-API-08–11)
- [ ] Step 7: Router pipeline + SFN repository (RF-API-12, 13, 13b)
- [ ] Step 8: Router athena — catalog, SQL files, poll service (RF-API-14)
- [ ] Step 9: Router ops/alarms + health (RF-API-01, 15)
- [ ] Step 10: pytest unit + hypothesis PBT em domain/
- [ ] Step 11: Terraform ECR + ECS task image (`terraform/modules/portal/`)
- [ ] Step 12: `scripts/w7-us12-deploy.ps1` + `scripts/w7-us12-validate.ps1`
- [ ] Step 13: `docs/portal-deploy-dev.md` + `portal-api/README.md`
- [ ] Step 14: Deploy dev + smoke API GW
- [ ] Step 15: Atualizar `stories.md` E8-US12 → `done` após checklist E2E manual

---

## Story Traceability

| Step | Critério E8-US12 |
|------|------------------|
| 1–9 | FastAPI + RF-API-01,02,04–15 |
| 1 | OpenAPI `/docs` |
| 11–12 | ECS deploy + script/doc |
| 14–15 | E2E login → D-1 → Excel |

---

## Arquivos principais

| Ação | Caminho |
|------|---------|
| Novo | `portal-api/app/**` |
| Novo | `portal-api/tests/**` |
| Novo | `portal-api/Dockerfile` |
| Alterar | `terraform/modules/portal/ecs.tf`, `ecr.tf` |
| Novo | `scripts/w7-us12-deploy.ps1`, `w7-us12-validate.ps1` |
| Novo | `docs/portal-deploy-dev.md` |

---

## Fora de escopo Part 2

- RF-API-03 upload
- Remoção mock Angular (opcional follow-up)
- CI/CD GitHub Actions
- Prod/staging environments

---

## Regressão obrigatória

- `portal-web` build + 125 specs inalterados
- `terraform plan` sem destroy portal
- Lambdas W5/W6 independentes
