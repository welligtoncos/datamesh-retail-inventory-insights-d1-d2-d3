# Code Generation Plan · U8 Portal Web Athena Templates

**Stories:** E8-US11  
**Unit:** U8-Portal-Web  
**Status:** Part 2 concluído — E8-US11 done  
**Data:** 2026-07-01

---

## Unit Context

- Brownfield: portal com enriquecido E8-US06, commit base `b5dcc5a` (E8-US10, 111 specs)
- Athena: `retail_inventory_insights_dev.enriquecido`, WG `retail-inventory-insights-dev`
- Design: `aidlc-docs/construction/u8-portal-web/athena-templates/`
- Doc templates: `scripts/athena-validation-queries.md`

---

## Steps (Part 2 — após aprovação)

- [x] Step 1: Criar `models/athena.model.ts`
- [x] Step 2: Criar `athena-templates.catalog.ts` (9 templates whitelist)
- [x] Step 3: Criar `athena-template-params.util.ts` + tests PBT
- [x] Step 4: Criar `athena-results-mock.data.ts`
- [x] Step 5: Criar `AthenaApiService` + `AthenaFacadeService`
- [x] Step 6: Criar `AthenaTemplateListComponent` + `AthenaTemplateRunFormComponent`
- [x] Step 7: Criar `AthenaResultsTableComponent`
- [x] Step 8: Criar `EnriquecidoAthenaPageComponent` + rota `/enriquecido/athena`
- [x] Step 9: Link “Consultas Athena” em `EnriquecidoPageComponent` com `?dt=`
- [x] Step 10: Regressão enriquecido, home, insights, operações specs
- [x] Step 11: `scripts/w7-us11-validate.ps1`
- [x] Step 12: Atualizar `portal-web/README.md` e `code-summary.md`
- [x] Step 13: Atualizar `stories.md` E8-US11 → `done` após checklist manual

---

## Story Traceability

| Step | Critério E8-US11 |
|------|------------------|
| 5 | POST /athena/query-template |
| 6–8 | UI lista templates + resultado tabular |
| 2, 3 | Sem SQL livre; whitelist |
| 4 | Mock paridade 2022-01-01 |
| 9 | Integração dt enriquecido |

---

## Arquivos principais

| Ação | Caminho |
|------|---------|
| Novo | `portal-web/src/app/core/api/athena-*.ts` |
| Novo | `portal-web/src/app/features/enriquecido/athena/*.ts` |
| Alterar | `portal-web/src/app/app.routes.ts` |
| Alterar | `portal-web/src/app/features/enriquecido/enriquecido-page.component.ts` |
| Novo | `scripts/w7-us11-validate.ps1` |

---

## Fora de escopo Part 2

- `portal-api/` FastAPI (E8-US12)
- Terraform / Glue / Athena IAM changes
- Editor SQL ad hoc
