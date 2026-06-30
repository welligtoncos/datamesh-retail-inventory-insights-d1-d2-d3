# Code Generation Plan · U8 Portal Web Shell

**Stories:** E8-US03  
**Unit:** U8-Portal-Web  
**Status:** Part 2 — concluído (E8-US03 done)  
**Data:** 2026-06-30

---

## Unit Context

- Brownfield: `portal-web/` com auth E8-US02 (commit `55d58ee`)
- BFF FastAPI inexistente (E8-US12); nginx + `GET /health` público
- Mock KPIs brownfield `dt=2022-01-01` até API enriquecido disponível
- Design: `aidlc-docs/construction/u8-portal-web/shell/`

---

## Steps (Part 2 — após aprovação)

- [x] Step 1: Criar `core/api/models/` (`health`, `enriquecido`, `dashboard`)
- [x] Step 2: Implementar `HealthService` + `HealthBadgeComponent` (poll 60s)
- [x] Step 3: Implementar `ApiErrorService` + `ApiErrorBannerComponent`
- [x] Step 4: Implementar `EnriquecidoApiService` (HTTP real + catch)
- [x] Step 5: Implementar `DashboardService` (API + mock fallback)
- [x] Step 6: Criar `layout/app-shell/` (`AppShellComponent` + `shell-nav.config.ts`)
- [x] Step 7: Criar `PlaceholderPageComponent` reutilizável
- [x] Step 8: Criar `HomeDashboardComponent` + cards KPI e atalhos insights
- [x] Step 9: Refatorar `app.routes.ts` — shell pai + rotas filhas + placeholders
- [x] Step 10: Remover toolbar duplicada do antigo `HomeComponent` (substituído pelo shell)
- [x] Step 11: Estilos responsivos SCSS (breakpoints desktop/tablet)
- [x] Step 12: Unit tests — `dashboard.service`, `api-error.service`, `shell-nav.config`
- [x] Step 13: `scripts/w7-us03-validate.ps1`
- [x] Step 14: Atualizar `portal-web/README.md` e `shell/code-summary.md`
- [x] Step 15: Atualizar `stories.md` E8-US03 → `done` após checklist manual

---

## Story Traceability

| Step | Critério aceite E8-US03 |
|------|-------------------------|
| 6–7, 9 | RF-M7-01 menu 5 módulos + insights |
| 5, 8 | RF-M7-02 último dt, KPIs, atalhos D-1/D-2/D-3 |
| 3 | RF-M7-03 erros PT-BR |
| 11 | RF-M7-04 responsivo |
| 6–8 | RF-M7-05 PT-BR |
| 2 | RF-M5-05 health badge |

---

## Arquivos principais a criar/alterar

| Ação | Caminho |
|------|---------|
| Novo | `portal-web/src/app/layout/app-shell/` |
| Novo | `portal-web/src/app/core/api/` |
| Novo | `portal-web/src/app/core/errors/` |
| Novo | `portal-web/src/app/shared/components/` |
| Alterar | `portal-web/src/app/app.routes.ts` |
| Alterar | `portal-web/src/app/features/home/` |
| Novo | `scripts/w7-us03-validate.ps1` |

---

## Fora de escopo Part 2

- Implementação real Insumos/Origem/Enriquecido/Insights/Operações (E8-US04+)
- FastAPI BFF (E8-US12)
- ngx-translate / i18n multi-idioma
- Terraform CloudFront SPA error pages (somente doc se necessário)
