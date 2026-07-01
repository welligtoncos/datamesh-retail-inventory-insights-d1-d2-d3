# Code Generation Plan · U8 Portal Web Ops Alarms + Health

**Stories:** E8-US10  
**Unit:** U8-Portal-Web  
**Status:** Part 1 — aguardando aprovação  
**Data:** 2026-06-30

---

## Unit Context

- Brownfield: portal com home E8-US03, health badge shell, operações E8-US09 (commit `fba5a7c`)
- Alarme: `retail-inventory-insights-processar-dia-failed-dev`
- Design: `aidlc-docs/construction/u8-portal-web/ops-alarms-health/`

---

## Steps (Part 2 — após aprovação)

- [ ] Step 1: Criar `models/ops-alarms.model.ts` + `esteira-status.model.ts`
- [ ] Step 2: Criar `esteira-status.util.ts`, `cloudwatch-console-url.util.ts`
- [ ] Step 3: Criar `ops-alarms-mock.data.ts`
- [ ] Step 4: Criar `OpsAlarmsApiService` + `OpsAlarmsFacadeService`
- [ ] Step 5: Criar `EsteiraStatusFacadeService` (forkJoin health + alarms)
- [ ] Step 6: Criar `EsteiraStatusCardComponent` (card + poll 60s + `?alarm=demo`)
- [ ] Step 7: Integrar card em `HomeDashboardComponent`
- [ ] Step 8: Regressão `HealthService`, `HealthBadgeComponent`, `DashboardService` specs
- [ ] Step 9: Unit tests — `esteira-status.util`, facades, console URL
- [ ] Step 10: `scripts/w7-us10-validate.ps1`
- [ ] Step 11: Atualizar `portal-web/README.md` e `code-summary.md`
- [ ] Step 12: Atualizar `stories.md` E8-US10 → `done` após checklist manual

---

## Story Traceability

| Step | Critério E8-US10 |
|------|------------------|
| 4, 5 | GET /ops/alarms OK/ALARM |
| 1, 5, 6 | GET /health + card esteira |
| 6, 7 | Badge home operacional / em alarme |
| 8 | RF-API-01 regressão |
| 9 | RF-API-15 |

---

## Arquivos principais

| Ação | Caminho |
|------|---------|
| Novo | `portal-web/src/app/core/api/ops-alarms-*.ts` |
| Novo | `portal-web/src/app/core/api/esteira-status-*.ts` |
| Novo | `portal-web/src/app/features/home/esteira-status-card.component.ts` |
| Alterar | `portal-web/src/app/features/home/home-dashboard.component.ts` |
| Novo | `scripts/w7-us10-validate.ps1` |

---

## Fora de escopo Part 2

- Terraform / `ensure-sfn-alarm.ps1`
- `/operacoes` changes
- E8-US11 Athena, E8-US12 BFF deploy
