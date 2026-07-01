# Code Summary · U8 Portal Web Insumos (E8-US04)

**Data:** 2026-06-30  
**Story:** E8-US04 · Listar insumos (M1)

## Artefatos gerados

### Feature Insumos
- `features/insumos/insumos-list.component.ts` — página `/insumos`
- `insumos-table.component.ts` — mat-table + matSort
- `insumos-empty-state.component.ts`, `upload-phase2-notice.component.ts`

### Core API
- `core/api/models/insumo.model.ts`
- `InsumosApiService` — GET /insumos
- `InsumosFacadeService` — API + mock fallback
- `insumos-sort.util.ts`

### Shared
- `shared/pipes/file-size.pipe.ts` — tamanho PT-BR

### Config
- `app.routes.ts` — `/insumos` → InsumosListComponent
- `app.config.ts` — locale `pt`

### Scripts
- `scripts/w7-us04-validate.ps1`

## Testes
- 27 unit tests SUCCESS (+8 novos: facade, pipe, sort)

## Validação manual pendente
- Tabela insumos após login
- Notice upload fase 2
- GET /insumos com JWT (404 → mock OK)

## Próxima story
- E8-US05 — Partições origem e preview (M2)
