# Code Generation Plan · U8 Portal Web Insumos

**Stories:** E8-US04  
**Unit:** U8-Portal-Web  
**Status:** Part 2 — concluído (E8-US04 done)  
**Data:** 2026-06-30

---

## Unit Context

- Brownfield: `portal-web/` com shell E8-US03 (commit `155bd32`)
- Rota `/insumos` hoje = `PlaceholderPageComponent`
- BFF FastAPI inexistente (E8-US12); mock `retail_store_inventory.csv`
- Design: `aidlc-docs/construction/u8-portal-web/insumos/`

---

## Steps (Part 2 — após aprovação)

- [x] Step 1: Criar `core/api/models/insumo.model.ts`
- [x] Step 2: Implementar `InsumosApiService` (`GET /insumos`)
- [x] Step 3: Implementar `InsumosFacadeService` (API + mock fallback)
- [x] Step 4: Criar `shared/pipes/file-size.pipe.ts`
- [x] Step 5: Criar `features/insumos/insumos-table.component.ts` (mat-table + sort)
- [x] Step 6: Criar `insumos-empty-state` e `upload-phase2-notice`
- [x] Step 7: Criar `InsumosListComponent` (orquestra estados + ApiErrorBanner)
- [x] Step 8: Atualizar `app.routes.ts` — `/insumos` → `InsumosListComponent`
- [x] Step 9: Registrar locale `pt-BR` se necessário (`app.config.ts`)
- [x] Step 10: Unit tests — facade, file-size pipe, sort util
- [x] Step 11: `scripts/w7-us04-validate.ps1`
- [x] Step 12: Atualizar `portal-web/README.md` e `insumos/code-summary.md`
- [x] Step 13: Atualizar `stories.md` E8-US04 → `done` após checklist manual

---

## Story Traceability

| Step | Critério aceite E8-US04 |
|------|-------------------------|
| 2–3 | RF-API-02 GET /insumos |
| 5–7 | RF-M1-01 tabela nome, tamanho, LastModified |
| 6 | Upload fora de escopo (notice fase 2) |
| 10 | Extensions PBT |

---

## Arquivos principais

| Ação | Caminho |
|------|---------|
| Novo | `portal-web/src/app/features/insumos/` |
| Novo | `portal-web/src/app/core/api/insumos-*.ts` |
| Novo | `portal-web/src/app/shared/pipes/file-size.pipe.ts` |
| Alterar | `portal-web/src/app/app.routes.ts` |
| Novo | `scripts/w7-us04-validate.ps1` |

---

## Fora de escopo Part 2

- FastAPI `portal-api/` (E8-US12)
- Upload presigned URL (RF-M1-02)
- Paginação server-side (lista pequena em dev)
- Terraform IAM/S3 changes
