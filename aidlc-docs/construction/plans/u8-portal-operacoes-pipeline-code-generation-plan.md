# Code Generation Plan · U8 Portal Web Operações Pipeline

**Stories:** E8-US09  
**Unit:** U8-Portal-Web  
**Status:** Part 2 concluído — E8-US09 done (checklist manual OK)  
**Data:** 2026-06-30

---

## Unit Context

- Brownfield: `portal-web/` com insights D-1/D-2/D-3 E8-US07–08 (commit `f07a5a7`)
- Rota `/operacoes` = `PlaceholderPageComponent` hoje
- SFN: `retail-inventory-insights-processar-dia-dev`, input `{"dt"}`
- Dev proxy: `apiBaseUrl: '/api'` + `proxy.conf.json`
- Design: `aidlc-docs/construction/u8-portal-web/operacoes-pipeline/`

---

## Steps (Part 2 — após aprovação)

- [x] Step 1: Criar `models/pipeline.model.ts` (DTOs + status enum)
- [x] Step 2: Criar `pipeline-date.util.ts`, `pipeline-duration.util.ts`, `pipeline-console-url.util.ts`
- [x] Step 3: Criar `pipeline-mock.data.ts` + `pipeline-execution-mock.store.ts`
- [x] Step 4: Criar `PipelineApiService` + `PipelineFacadeService` (list, start, get, polling helpers)
- [x] Step 5: Criar `PipelineDtSelectorComponent` + `PipelineTriggerPanelComponent`
- [x] Step 6: Criar `PipelineActiveExecutionComponent` (RUNNING/terminal)
- [x] Step 7: Criar `PipelineExecutionsTableComponent` (RF-M5-03)
- [x] Step 8: Criar `OperacoesPageComponent` (estados + `?dt=` + polling lifecycle)
- [x] Step 9: Atualizar `app.routes.ts` — `/operacoes`
- [x] Step 10: Atualizar `InsightMissingPartitionBannerComponent` — `queryParams dt`, remover tooltip E8-US09
- [x] Step 11: Regressão specs insights/home/origem/enriquecido
- [x] Step 12: Unit tests — date, duration, mock store order, facade fallback
- [x] Step 13: `scripts/w7-us09-validate.ps1`
- [x] Step 14: Atualizar `portal-web/README.md` e `operacoes-pipeline/code-summary.md`
- [x] Step 15: Atualizar `stories.md` E8-US09 → `done` após checklist manual

---

## Story Traceability

| Step | Critério aceite E8-US09 |
|------|-------------------------|
| 4, 8 | POST processar-dia inicia pipeline |
| 6, 8 | Status RUNNING/SUCCEEDED/FAILED |
| 7, 8 | Histórico 20 execuções |
| 4 | Audit sub + timestamp |
| 10 | CTA insights com dt |
| 12 | RF-API-12, RF-API-13 |
| 11 | D-1/D-2/D-3 sem regressão |

---

## Arquivos principais

| Ação | Caminho |
|------|---------|
| Novo | `portal-web/src/app/features/operacoes/` |
| Novo | `portal-web/src/app/core/api/pipeline-*.ts` |
| Alterar | `portal-web/src/app/app.routes.ts` |
| Alterar | `portal-web/src/app/features/insights/shared/insight-missing-partition-banner.component.ts` |
| Novo | `scripts/w7-us09-validate.ps1` |

---

## Fora de escopo Part 2

- FastAPI BFF SFN boto3 (E8-US12)
- Alarmes `GET /ops/alarms` (E8-US10)
- Athena (E8-US11)
- Terraform / SFN changes
