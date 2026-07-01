# Prompt AI-DLC · E8-US09 — Operações / Pipeline SFN (M5)

Copie o bloco abaixo em um novo chat Cursor para iniciar a story no workflow AI-DLC.

---

```
using aidlc, siga o workflow AI-DLC na fase CONSTRUCTION para a unidade U8-Portal-Web — story E8-US09 (Disparar pipeline e acompanhar execução M5).

## Instrução de fase
- Executar APENAS Part 1 (design): application-design, functional-design, nfr-requirements, nfr-design, infrastructure-design, code-generation-plan Part 1 com checkboxes.
- NÃO gerar código em portal-web/ até eu responder "Continue to Next Stage".
- Ao final da Part 1: apresentar resumo + opções "Request Changes" / "Continue to Next Stage".
- Seguir extensions habilitadas: Security Baseline, Resiliency Baseline, Property-Based Testing (aidlc-state.md).

## Story
- **ID:** E8-US09 · Disparar pipeline e acompanhar execução (M5)
- **Persona:** P2 Engenheiro de dados / usuário autenticado
- **Como** usuário autenticado, **quero** processar um `dt` e ver status da Step Function, **para** reprocessar dia sem script PowerShell.
- **Status atual:** backlog → marcar in_progress ao iniciar
- **Depende:** E8-US05 (origem), E4 (SFN) — já done no projeto
- **Commit base portal:** f07a5a7 (E8-US08 done — insights D-1/D-2/D-3 + shared + proxy dev)

## Contexto brownfield
- **SFN:** `retail-inventory-insights-processar-dia-dev` (us-east-1, conta 303238378103)
- **Input SFN:** `{"dt": "YYYY-MM-DD"}`
- **Fluxo:** CarregarOrigem (Glue) → EnriquecerDia (Glue) → Sucesso | FalhaProcessamento
- **Script legado:** `scripts/reprocessar-dia-dev.ps1` (referência de comportamento esperado)
- **Doc:** `docs/dev-testar-esteira.md`, `aidlc-docs/construction/u4-orquestracao/application-design.md`
- **Bucket dev:** `retail-inventory-insights-dev-use1`
- **Mock partições:** `2022-01-01`, `2022-01-02` (enriquecido-mock.data.ts)

## Estado atual do portal
- Rota `/operacoes` = `PlaceholderPageComponent` (`app.routes.ts`)
- Menu shell: item "Operações" → `/operacoes` (`shell-nav.config.ts`)
- Banners insights D-1/D-2/D-3: CTA "Ir para Operações" com tooltip "Disparo do pipeline estará disponível em E8-US09" — **substituir** por fluxo real nesta story
- Padrão estabelecido: ApiService + FacadeService + mock fallback em 404/erro (como insights-d1/d2/d3)
- Dev local: `apiBaseUrl: '/api'` + `proxy.conf.json` → API GW (sem CORS)
- BFF FastAPI real: **fora de escopo** (E8-US12); contratos API devem estar prontos no frontend

## Escopo IN (E8-US09)
1. Substituir placeholder `/operacoes` por página **Operações** (pipeline M5)
2. **RF-M5-01:** disparar pipeline — `POST /pipeline/processar-dia` body `{ "dt": "YYYY-MM-DD" }` → StartExecution SFN
3. **RF-M5-02:** acompanhar execução em tempo quase real — status RUNNING / SUCCEEDED / FAILED (polling ou refresh manual + auto-poll opcional)
4. **RF-M5-03:** histórico últimas **20** execuções (dt, duração, status, execution_arn ou id curto)
5. **RF-M6-04:** auditoria no contrato — resposta/log deve refletir `sub` Cognito + timestamp (mock até BFF; desenhar DTO)
6. **RF-M2-05 / RF-M4-06:** integração UX — CTA "processar agora" nos banners de partição ausente (insights) e/ou origem apontando para `/operacoes?dt=`
7. Contratos **RF-API-12**, **RF-API-13** no Angular (services + models)
8. Mock brownfield para dev sem BFF (execuções simuladas, transição RUNNING→SUCCEEDED)
9. Unit tests (utils de dt/duração, facade mock fallback, PBT onde aplicável)
10. `scripts/w7-us09-validate.ps1` (planejar na Part 2)
11. Atualizar `portal-web/README.md`, `stories.md`, `aidlc-state.md`, `audit.md`

## Escopo OUT (não implementar nesta story)
- **E8-US10:** alarmes CloudWatch `GET /ops/alarms`, badge alarme na home (RF-M5-04) — apenas mencionar integração futura
- **E8-US12:** implementar FastAPI `portal-api/` e deploy ECS
- **E8-US11:** Athena templates
- Alterações Terraform/Lambda/Glue/SFN (apenas consumir SFN existente via API)
- Upload insumo (RF-API-03)
- RBAC por persona (fase 2)

## Contratos API (desenhar DTOs completos)

### POST /pipeline/processar-dia (RF-API-12, JWT)
Request: `{ "dt": "2022-01-01" }`
Response sugerida:
- `execution_arn`, `execution_id`, `dt`, `status` (RUNNING), `started_at`, `audit` { `sub`, `timestamp` }

### GET /pipeline/executions (RF-API-13, JWT)
Query opcional: `?limit=20`
Response: lista ordenada por `started_at` desc:
- `execution_id`, `dt`, `status`, `started_at`, `stopped_at`, `duration_seconds`, `execution_arn`

### GET /pipeline/executions/{id} (opcional — polling status único)
Se necessário para RF-M5-02 sem listar tudo.

## UI sugerida (validar no design)
- `OperacoesPageComponent` em `features/operacoes/`
- Seletor `dt` (mat-datepicker ou select partições conhecidas + input ISO)
- Botão primário "Processar dia" (confirmação se já houver RUNNING para o mesmo dt)
- Card/status da execução ativa com spinner se RUNNING
- Tabela histórico 20 linhas (mat-table + chips de status coloridos)
- Banner info mock "dados de demonstração" até BFF (padrão insights)
- Link opcional console AWS SFN (nova aba) — URL construída a partir de execution_arn
- Responsivo desktop/tablet; mensagens PT-BR (RF-M7-03, RF-M7-05)

## Regras de negócio
- `dt` formato ISO `YYYY-MM-DD`; validar antes do POST
- Idempotência: permitir reprocessar mesmo dt (SFN aceita nova execution); UI pode avisar
- Duração = `stopped_at - started_at` quando terminal; null se RUNNING
- Polling: intervalo 10–15s enquanto RUNNING na página; parar ao sair da rota
- Fallback mock em falha de API (como facades insights)

## Rastreabilidade obrigatória no design
- RF-M5-01, RF-M5-02, RF-M5-03
- RF-M6-04 (auditoria)
- RF-M2-05, RF-M4-06 (CTA reprocessar)
- RF-API-12, RF-API-13
- NFR-W7-03 (timeout 30s), NFR-W7-04 (retry idempotente no BFF futuro)

## Artefatos esperados (Part 1)
- `aidlc-docs/construction/u8-portal-web/operacoes-pipeline/`
  - application-design.md
  - functional-design/functional-design.md
  - nfr-requirements/nfr-requirements.md
  - nfr-design/nfr-design.md
  - infrastructure-design/infrastructure-design.md
- `aidlc-docs/construction/plans/u8-portal-operacoes-pipeline-code-generation-plan.md` (steps Part 2 com [ ])
- Referenciar diagrama portal: `diagrams/09-portal-web.mmd` se existir

## Part 2 (após aprovação — não executar agora)
- Implementar `portal-web/src/app/features/operacoes/`
- `core/api/pipeline-*.ts` (models, api, facade, mock, utils)
- Substituir placeholder em `app.routes.ts`
- Atualizar `insight-missing-partition-banner` (remover tooltip E8-US09; deep-link `?dt=`)
- Testes + build + checklist manual + commit `feat(portal-web): E8-US09 ...`

## Commits de referência
- E8-US07: 7b7ef49 (padrão insights facade)
- E8-US08: f07a5a7 (shared components, 79 specs)
- Design E8-US08: 0036dbc (estrutura aidlc-docs)
```
