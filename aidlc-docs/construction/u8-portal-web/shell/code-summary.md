# Code Summary · U8 Portal Web Shell (E8-US03)

**Data:** 2026-06-30  
**Story:** E8-US03 · Shell Angular e home dashboard

## Artefatos gerados

### Layout e navegação
- `layout/app-shell/` — `AppShellComponent` + `shell-nav.config.ts`
- `layout/placeholder-page/` — páginas "Em breve" para módulos futuros
- Rotas filhas: `/home`, `/insumos`, `/origem`, `/enriquecido`, `/insights/d1|d2|d3`, `/operacoes`

### Home dashboard
- `features/home/home-dashboard.component.ts` — KPIs, dt, atalhos D-1/D-2/D-3
- Mock brownfield `dt=2022-01-01` quando BFF indisponível

### Core API
- `core/api/models/` — health, enriquecido, dashboard
- `HealthService` — poll `/health` 60s
- `DashboardService` — API + fallback mock
- `EnriquecidoApiService` — contratos RF-API-06/07

### Shared
- `HealthBadgeComponent`, `ApiErrorBannerComponent`, `KpiSummaryCardComponent`, `InsightShortcutCardComponent`
- `ApiErrorService` — mensagens PT-BR (401, 500, timeout)

### Scripts
- `scripts/w7-us03-validate.ps1`

## Testes
- 19 unit tests SUCCESS (incl. dashboard, api-error, shell-nav, auth)

## Validação manual pendente
- Login → shell sidenav
- Home KPIs + atalhos
- Placeholders módulos
- Responsivo tablet
- Badge health

## Próxima story
- E8-US04 — Listar insumos (M1)
