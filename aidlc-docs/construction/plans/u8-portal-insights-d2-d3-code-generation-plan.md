# Code Generation Plan · U8 Portal Web Insights D-2 e D-3

**Stories:** E8-US08  
**Unit:** U8-Portal-Web  
**Status:** Part 1 — aguardando aprovação  
**Data:** 2026-06-30

---

## Unit Context

- Brownfield: `portal-web/` com insights D-1 E8-US07 (commit `7b7ef49`)
- Rotas `/insights/d2`, `/insights/d3` = `PlaceholderPageComponent` hoje
- Mock: enriquecido dt `2022-01-01`, `2022-01-02`; D-2 rupturas em `2022-01-02`
- Lambdas: `gerar_relatorio_d2.py`, `gerar_relatorio_d3.py`
- Design: `aidlc-docs/construction/u8-portal-web/insights-d2-d3/`

---

## Steps (Part 2 — após aprovação)

- [ ] Step 1: Criar `models/insights-d2.model.ts` e `insights-d3.model.ts`
- [ ] Step 2: Criar `d2-filter.util.ts`, `d3-trend.util.ts`, `d2-report-key.util.ts`, `d3-report-key.util.ts`
- [ ] Step 3: Criar `insights-d2-mock.data.ts` e `insights-d3-mock.data.ts`
- [ ] Step 4: Extrair `features/insights/shared/` (date selector, insight panel, download, missing banner)
- [ ] Step 5: Refatorar `insights/d1/` para usar shared (regressão testes D-1)
- [ ] Step 6: Criar `InsightsD2ApiService` + `InsightsD2FacadeService`
- [ ] Step 7: Criar `InsightsD3ApiService` + `InsightsD3FacadeService`
- [ ] Step 8: Criar `D2RupturasTableComponent` (RF-M4-03)
- [ ] Step 9: Criar `D3TrendTableComponent` + `D3WindowSelectorComponent` (RF-M4-04)
- [ ] Step 10: Criar `InsightsD2PageComponent` (layout + estados + `?dt=`)
- [ ] Step 11: Criar `InsightsD3PageComponent` (layout + `?dt=&window=`)
- [ ] Step 12: Atualizar `app.routes.ts` — `/insights/d2`, `/insights/d3`
- [ ] Step 13: Garantir D-1, home, enriquecido, origem inalterados (regressão specs)
- [ ] Step 14: Unit tests — d2-filter, d3-trend PBT, facades, report keys
- [ ] Step 15: `scripts/w7-us08-validate.ps1`
- [ ] Step 16: Atualizar `portal-web/README.md` e `insights-d2-d3/code-summary.md`
- [ ] Step 17: Atualizar `stories.md` E8-US08 → `done` após checklist manual

---

## Story Traceability

| Step | Critério aceite E8-US08 |
|------|-------------------------|
| 2, 3, 6 | D-2 filtro _stockout/_lost, sort _lost |
| 2, 3, 7 | D-3 tendência, janela N, úteis vs FDS |
| 4–11 | Download Excel D-2/D-3 (RF-M4-05) |
| shared banner | RF-M4-06 CTA partição ausente |
| insight panel | RF-M4-07 insight textual |
| 6–7 | RF-API-09, RF-API-10, RF-API-11 |
| 13 | D-1 não quebra |

---

## Arquivos principais

| Ação | Caminho |
|------|---------|
| Novo | `portal-web/src/app/features/insights/shared/` |
| Novo | `portal-web/src/app/features/insights/d2/` |
| Novo | `portal-web/src/app/features/insights/d3/` |
| Novo | `portal-web/src/app/core/api/insights-d2-*.ts` |
| Novo | `portal-web/src/app/core/api/insights-d3-*.ts` |
| Novo | `portal-web/src/app/core/api/d2-filter.util.ts` |
| Novo | `portal-web/src/app/core/api/d3-trend.util.ts` |
| Alterar | `portal-web/src/app/features/insights/d1/` (imports shared) |
| Alterar | `portal-web/src/app/app.routes.ts` |
| Novo | `scripts/w7-us08-validate.ps1` |

---

## Fora de escopo Part 2

- Pipeline SFN (E8-US09)
- FastAPI BFF (E8-US12)
- Athena (E8-US11)
- Terraform / Lambda changes
