# Prompt AI-DLC · E8-US10 — Alarmes CloudWatch e health na UI (M5)

Copie o bloco abaixo em um novo chat Cursor para iniciar a story no workflow AI-DLC.

---

```
using aidlc, siga o workflow AI-DLC na fase CONSTRUCTION para a unidade U8-Portal-Web — story E8-US10 (Alarmes CloudWatch e health na UI M5).

## Instrução de fase
- Executar APENAS Part 1 (design): application-design, functional-design, nfr-requirements, nfr-design, infrastructure-design, code-generation-plan Part 1 com checkboxes.
- NÃO gerar código em portal-web/ até eu responder "Continue to Next Stage".
- Ao final da Part 1: apresentar resumo + opções "Request Changes" / "Continue to Next Stage".
- Seguir extensions habilitadas: Security Baseline, Resiliency Baseline, Property-Based Testing (aidlc-state.md).

## Story
- **ID:** E8-US10 · Alarmes CloudWatch e health na UI (M5)
- **Persona:** P4 Plataforma AWS / TI
- **Como** plataforma AWS, **quero** ver estado do alarme SFN e saúde da API na home, **para** saber se a esteira falhou sem abrir o console AWS.
- **Status atual:** backlog → marcar in_progress ao iniciar
- **Depende:** E8-US09 (operações), E7-US02 (alarme SFN) — já done no projeto
- **Commit base portal:** fba5a7c (E8-US09 done — /operacoes pipeline + mock)

## Contexto brownfield
- **Alarme CW:** `retail-inventory-insights-processar-dia-failed-dev`
- **Métrica:** `AWS/States` · `ExecutionsFailed` · dimensão `StateMachineArn`
- **SFN:** `retail-inventory-insights-processar-dia-dev`
- **Script alarme:** `scripts/ensure-sfn-alarm.ps1` (Terraform não gerencia alarme nesta conta)
- **Doc W6:** `aidlc-docs/construction/u6-relatorios-ops/`, `terraform/modules/monitoring/`
- **Conta/região:** `303238378103` · `us-east-1`

## Estado atual do portal (E8-US03 + E8-US09)
- **Health existente (RF-API-01 / RF-M5-05 parcial):**
  - `HealthService` → `GET /health` (público, sem JWT no interceptor)
  - `HealthBadgeComponent` no **app-shell** (toolbar) — estados: `ok` / `degraded` / `offline`
  - Poll 60s via `shareReplay`
- **Home (`HomeDashboardComponent`):**
  - KPIs + atalhos D-1/D-2/D-3 via `DashboardService`
  - Banner se `health === offline'`; chip mock se `data_source === mock`
  - **Não exibe** estado do alarme SFN nem badge “esteira operacional / em alarme”
- **Operações (`/operacoes`):** pipeline M5 (E8-US09) — sem alarmes
- **Padrão:** ApiService + FacadeService + mock fallback 404
- **Dev:** `apiBaseUrl: '/api'` + `proxy.conf.json`
- **BFF real:** fora de escopo (E8-US12)

## Escopo IN (E8-US10)
1. **RF-API-15:** `GET /ops/alarms` (JWT) — estado alarme SFN OK/ALARM (+ metadados mínimos)
2. **RF-M5-04:** exibir alarme CloudWatch na UI (home)
3. **RF-M5-05:** consolidar indicador “esteira operacional” na **home** combinando:
   - saúde API (`GET /health`)
   - estado alarme SFN (`GET /ops/alarms`)
4. Badge/card na home com estados PT-BR, ex.:
   - **Esteira operacional** — health ok + alarm OK
   - **Esteira em alarme** — alarm ALARM (independente de health, ou com prioridade alarm)
   - **API indisponível** — health offline (já parcialmente coberto; integrar no mesmo componente)
5. Mock brownfield quando BFF indisponível (toggle OK/ALARM para demo)
6. Opcional: link console CloudWatch alarm / SFN (nova aba)
7. Unit tests + `scripts/w7-us10-validate.ps1` (planejar Part 2)
8. Atualizar docs aidlc + `portal-web/README.md`

## Escopo OUT
- Criar/alterar alarme Terraform ou `ensure-sfn-alarm.ps1` (já existe W6)
- SNS / notificações e-mail
- Página `/operacoes` alterações funcionais (salvo link contextual opcional)
- Athena (E8-US11), FastAPI deploy (E8-US12)
- Novos endpoints além de RF-API-15 (health já existe)

## Contratos API (desenhar DTOs)

### GET /health (RF-API-01 — já consumido, documentar paridade)
- Público; resposta texto `ok` ou JSON `{ status: 'ok'|'degraded' }`
- Frontend atual trata status HTTP + body

### GET /ops/alarms (RF-API-15, JWT)
Response sugerida:
```typescript
interface OpsAlarmItem {
  alarm_name: string;
  state: 'OK' | 'ALARM' | 'INSUFFICIENT_DATA';
  state_reason?: string;
  updated_at?: string; // ISO
  metric?: string; // ExecutionsFailed
  resource_arn?: string; // SFN ARN
}

interface OpsAlarmsResponse {
  alarms: OpsAlarmItem[];
  pipeline_operational: boolean; // derivado: primary alarm OK
}
```

BFF futuro: `cloudwatch:DescribeAlarms` filtrando `retail-inventory-insights-processar-dia-failed-dev`.

## UI sugerida (validar no design)

| Componente | Onde | Responsabilidade |
|------------|------|------------------|
| `EsteiraStatusCardComponent` | Home (topo, abaixo header) | Badge/card esteira operacional / em alarme |
| `OpsAlarmsApiService` | core/api | GET /ops/alarms |
| `OpsAlarmsFacadeService` | core/api | API + mock |
| `esteira-status.util.ts` | core/api | Derivar label/cor de health + alarm |

**Decisão de design:** manter `HealthBadgeComponent` no shell (API only) **e** adicionar card esteira na home — OU unificar com tooltip explicativo. Documentar trade-off na Part 1.

Estados derivados sugeridos:
| health | alarm | Label home |
|--------|-------|------------|
| ok | OK | Esteira operacional |
| ok | ALARM | Esteira em alarme |
| ok | INSUFFICIENT_DATA | Esteira — dados insuficientes |
| offline | * | API indisponível |
| degraded | OK | API degradada — esteira OK |

## Regras de negócio
- Poll alarmes: 60s (alinhar com HealthService) ou refresh manual na home
- ALARM tem prioridade visual sobre OK quando ambos disponíveis
- Mock default: `OK` (operacional); opção demo `ALARM` via query `?alarm=demo` ou constante dev
- Mensagens PT-BR (RF-M7-03, RF-M7-05)
- JWT obrigatório em `/ops/alarms`; `/health` permanece público

## Rastreabilidade obrigatória
- RF-M5-04, RF-M5-05
- RF-API-01 (health — regressão)
- RF-API-15 (alarms)
- NFR-W7-04 (resiliência — fallback mock)
- Persona P4

## Artefatos esperados (Part 1)
- `aidlc-docs/construction/u8-portal-web/ops-alarms-health/`
  - application-design.md
  - functional-design/functional-design.md
  - nfr-requirements/nfr-requirements.md
  - nfr-design/nfr-design.md
  - infrastructure-design/infrastructure-design.md
  - code-summary.md
- `aidlc-docs/construction/plans/u8-portal-ops-alarms-health-code-generation-plan.md`

## Part 2 (após aprovação — não executar agora)
- `ops-alarms.model.ts`, `ops-alarms-api.service.ts`, `ops-alarms-facade.service.ts`
- `esteira-status.util.ts`, mock data
- `EsteiraStatusCardComponent` + integrar em `HomeDashboardComponent`
- Testes facade + util; regressão `HealthService`, `DashboardService`, home specs
- `scripts/w7-us10-validate.ps1`
- Commit `feat(portal-web): E8-US10 ...`

## Regressão obrigatória
- Shell `HealthBadgeComponent` inalterado ou melhorado sem quebrar
- Home KPIs e atalhos D-1/D-2/D-3
- `/operacoes` pipeline E8-US09
- Insights M4

## Commits de referência
- E8-US03: shell + home + health badge
- E8-US09: fba5a7c (operações pipeline)
- Design E8-US09: 6cdc3b5
```
