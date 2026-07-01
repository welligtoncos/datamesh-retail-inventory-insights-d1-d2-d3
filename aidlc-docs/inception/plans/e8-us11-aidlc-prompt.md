# Prompt AI-DLC · E8-US11 — Athena templates no portal (M3)

Copie o bloco abaixo em um novo chat Cursor para iniciar a story no workflow AI-DLC.

---

```
using aidlc, siga o workflow AI-DLC na fase CONSTRUCTION para a unidade U8-Portal-Web — story E8-US11 (Athena templates no portal M3).

## Instrução de fase
- Executar APENAS Part 1 (design): application-design, functional-design, nfr-requirements, nfr-design, infrastructure-design, code-generation-plan Part 1 com checkboxes.
- NÃO gerar código em portal-web/ até eu responder "Continue to Next Stage".
- Ao final da Part 1: apresentar resumo + opções "Request Changes" / "Continue to Next Stage".
- Seguir extensions habilitadas: Security Baseline, Resiliency Baseline, Property-Based Testing (aidlc-state.md).

## Story
- **ID:** E8-US11 · Athena templates no portal (M3)
- **Persona:** P1 Analista de estoque
- **Como** analista de estoque, **quero** executar queries pré-aprovadas sobre enriquecido, **para** validar dados sem editor SQL livre.
- **Status atual:** backlog → marcar in_progress ao iniciar
- **Depende:** E8-US06 (enriquecido M3), E7-US01 (Athena/Glue deploy) — já done no projeto
- **Commit base portal:** b5dcc5a (E8-US10 done — EsteiraStatusCard + GET /ops/alarms + 111 specs)

## Contexto brownfield (Athena / Glue)
- **Database Glue:** `retail_inventory_insights_dev`
- **Workgroup:** `retail-inventory-insights-dev`
- **Tabela catalogada:** `enriquecido` (única camada consultável via Athena)
- **Região / conta:** `us-east-1` · `303238378103`
- **Bucket dados:** `s3://retail-inventory-insights-dev-use1/enriquecido/dt=YYYY-MM-DD/`
- **Resultados Athena:** `s3://retail-inventory-insights-dev-use1/athena-results/`
- **Doc templates:** `scripts/athena-validation-queries.md` + `scripts/athena-validation-queries.sql`
- **Terraform:** `terraform/modules/athena/` · outputs `athena_database_name`, `athena_workgroup_name`
- **IAM portal (futuro BFF):** `terraform/modules/portal/iam.tf` — `athena:StartQueryExecution`, `GetQueryResults`, etc.
- **Validação W6:** `scripts/w6-run-and-validate.ps1`

## Valores de referência mock (dt = 2022-01-01)
| Métrica | Esperado |
|---------|----------|
| linhas | 100 |
| receita_total | 879026.03 |
| pct_stockout | 0% |
| produtos distintos (D-1) | 69 |
| total_unidades (D-1) | 14484 |

Partições mock portal: `2022-01-01`, `2022-01-02` (`enriquecido-mock.data.ts`).

## Estado atual do portal
- **`/enriquecido`:** `EnriquecidoPageComponent` — partições, KPIs, preview paginado, comparativo (E8-US06)
- **Shell nav:** Insumos, Origem, Enriquecido, Insights (D-1/D-2/D-3), Operações — **sem** item Athena dedicado
- **RF-M3-05:** ainda **não implementado** (marcado N/A em E8-US06)
- **Padrão:** ApiService + FacadeService + mock fallback 404/erro
- **Dev:** `apiBaseUrl: '/api'` + `proxy.conf.json`
- **BFF FastAPI real:** fora de escopo (E8-US12); contratos no frontend devem estar prontos
- **Specs atuais:** 111 (após E8-US10)

## Escopo IN (E8-US11)
1. **RF-API-14:** `POST /athena/query-template` (JWT) — body `{ template_id, params? }`
2. **RF-M3-05:** UI para listar templates pré-aprovados e executar um selecionado
3. Resultado **tabular** com limite de linhas (alinhar NFR-W7-03: preview ≤ 500; sugerir cap Athena UI **100** linhas + flag `truncated`)
4. Parâmetros por template: pelo menos **`dt`** (ISO `YYYY-MM-DD`); templates multi-dt aceitam `dts[]`
5. Estados de execução: `QUEUED` / `RUNNING` / `SUCCEEDED` / `FAILED` / `CANCELLED` (UI spinner + mensagem PT-BR)
6. **Sem editor SQL ad hoc** — apenas `template_id` da lista documentada (whitelist)
7. Catálogo de templates espelhando seções de `athena-validation-queries.md` (IDs estáveis, ver sugestão abaixo)
8. Mock brownfield com resultados coerentes com `enriquecido-mock.data.ts`
9. Integração UX com partição selecionada em `/enriquecido` (reutilizar `dt` ativa ou `?dt=` na URL)
10. Unit tests (catalog validation, param binding, facade mock, PBT em utils puros)
11. `scripts/w7-us11-validate.ps1` (planejar Part 2)
12. Atualizar `portal-web/README.md`, `stories.md`, `aidlc-state.md`, `audit.md`

## Escopo OUT
- Editor SQL livre / textarea SQL (fase 2 — Q9 opção A rejeitada)
- Implementar `portal-api/` FastAPI ou deploy ECS (E8-US12)
- Alterações Terraform/Glue/Athena (consumir recursos existentes)
- Consultar camada `origem` via Athena (não catalogada)
- Upload insumo, pipeline SFN, alarmes, insights D-1/D-2/D-3 alterações funcionais
- RBAC por persona (fase 2)

## Decisão UX (validar na Part 1)
| Opção | Prós | Contras |
|-------|------|---------|
| **A — Painel em `/enriquecido`** | Completa M3 sem novo item de menu; reusa `dt` selecionada | Página enriquecido fica mais longa |
| **B — Rota filha `/enriquecido/athena`** | Separação clara; deep-link | Requer tab/link na página enriquecido |
| **C — Rota `/athena` + item shell** | Visível no menu | Altera RF-M7-01 (menu fixo) |

**Recomendação sugerida:** opção **A ou B** (não alterar shell nav sem justificativa forte).

## Catálogo de templates sugerido (whitelist — validar IDs na Part 1)

| template_id | Título PT-BR | Seção doc | Params | Descrição |
|-------------|--------------|-----------|--------|-----------|
| `smoke_preview` | Amostra enriquecido | §1 | `dt` | 5 linhas com colunas `_revenue`, `_stockout`, etc. |
| `partition_sanity` | Sanidade da partição | §2 | `dt` | Contagem linhas, lojas, receita, % ruptura |
| `enriched_null_check` | Colunas enriquecidas | §3 | `dt` | Verifica nulos em `_revenue`, `_stockout`, `_lost` |
| `d1_top_products` | Top produtos (D-1) | §4 | `dt`, `limit?` | Ranking unidades/receita |
| `d1_totals` | Totais comerciais (D-1) | §4 | `dt` | Produtos distintos, unidades, receita |
| `d2_stockouts` | Rupturas (D-2) | §5 | `dt` | `_stockout=1` e `_lost>0` |
| `d2_top_lost` | Top venda perdida | §5.1 / E7 | `dt`, `limit?` | GROUP BY loja×produto |
| `d3_weekend_trend` | Tendência úteis vs FDS | §6 | `dts` (2–7 dt) | Médias por loja×produto |
| `multi_dt_coverage` | Cobertura multi-dt | §2.1 | `dts` | Linhas e receita por dt |

> BFF futuro: mapear cada `template_id` → SQL parametrizado (sem concatenação insegura); rejeitar IDs desconhecidos com 400.

## Contratos API (desenhar DTOs completos)

### GET `/athena/templates` (opcional — JWT)
Se não exposto pelo BFF, catálogo **estático** no frontend (`athena-templates.catalog.ts`) sincronizado com `athena-validation-queries.md`.

Response sugerida:
```typescript
interface AthenaTemplateDefinition {
  template_id: string;
  title: string;
  description: string;
  category: 'smoke' | 'sanity' | 'd1' | 'd2' | 'd3' | 'quality';
  params_schema: {
    dt?: { required: boolean; label: string };
    dts?: { required: boolean; min_items: number; max_items: number; label: string };
    limit?: { required: boolean; default: number; max: number };
  };
}
```

### POST `/athena/query-template` (RF-API-14, JWT)
Request:
```typescript
interface AthenaQueryTemplateRequest {
  template_id: string;
  params?: {
    dt?: string;       // YYYY-MM-DD
    dts?: string[];    // YYYY-MM-DD[]
    limit?: number;    // cap no BFF (ex.: max 100)
  };
}
```

Response sugerida:
```typescript
type AthenaQueryStatus = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

interface AthenaQueryTemplateResponse {
  query_execution_id: string;
  template_id: string;
  status: AthenaQueryStatus;
  columns: string[];
  rows: Record<string, string | number | null>[];
  row_count: number;
  truncated: boolean;
  data_scan_bytes?: number;
  execution_time_ms?: number;
  state_reason?: string; // se FAILED
}
```

**BFF futuro (E8-US12):** `StartQueryExecution` → poll `GetQueryExecution` até SUCCEEDED/FAILED (timeout **60s** NFR-W7-03) → `GetQueryResults` com paginação truncada.

**Mock:** resposta imediata `SUCCEEDED` com linhas pré-computadas por `template_id` + `params`.

## UI sugerida (validar no design)

| Componente | Responsabilidade |
|------------|------------------|
| `AthenaTemplatesPanelComponent` ou `AthenaPageComponent` | Lista templates (mat-list / cards) |
| `AthenaTemplateRunFormComponent` | Params (`dt` select partições conhecidas, `dts` multi-select, botão Executar) |
| `AthenaResultsTableComponent` | `mat-table` dinâmico por `columns`; chip `truncated` |
| `AthenaApiService` | POST `/athena/query-template` |
| `AthenaFacadeService` | API + mock fallback |
| `athena-templates.catalog.ts` | Definições + labels PT-BR |
| `athena-template-params.util.ts` | Valida/bind params antes do POST |
| `athena-results-mock.data.ts` | Resultados mock por template |

UX:
- Banner chip **Dados de demonstração** quando `data_source === 'mock'`
- Botão **Executar consulta** desabilitado se params inválidos
- Spinner durante `RUNNING` (mock instantâneo; API real pode demorar)
- Mensagens PT-BR para FAILED / timeout (RF-M7-03, RF-M7-05)
- **Não** exibir SQL bruto ao usuário (opcional: tooltip “template pré-aprovado”)

## Regras de negócio
- `dt` obrigatório onde o template exige; validar ISO `YYYY-MM-DD` antes do POST
- `dts` ordenados asc; deduplicar; máximo 7 datas (D-3 trend)
- `limit` default 10 onde aplicável; máximo 100 no portal
- Partição deve existir na lista `GET /enriquecido/partitions` (ou mock); avisar se `dt` sem dados
- Rejeitar `template_id` fora do catálogo (frontend guard + BFF futuro)
- **Security:** nunca enviar SQL livre; apenas `template_id` + params tipados

## Rastreabilidade obrigatória
- RF-M3-05 (Athena templates)
- RF-API-14 (`POST /athena/query-template`)
- NFR-W7-03 (timeout Athena 60s; limite linhas)
- NFR-W7-04 (fallback mock; mensagem se Athena indisponível)
- Persona P1

## Artefatos esperados (Part 1)
- `aidlc-docs/construction/u8-portal-web/athena-templates/`
  - application-design.md
  - functional-design/functional-design.md
  - nfr-requirements/nfr-requirements.md
  - nfr-design/nfr-design.md
  - infrastructure-design/infrastructure-design.md
  - code-summary.md
- `aidlc-docs/construction/plans/u8-portal-athena-templates-code-generation-plan.md` (steps Part 2 com [ ])

## Part 2 (após aprovação — não executar agora)
- `portal-web/src/app/core/api/athena-*.ts` (models, api, facade, catalog, mock, utils)
- Componente(s) em `features/enriquecido/` ou `features/athena/`
- Integrar em `EnriquecidoPageComponent` (ou rota filha)
- Testes facade + utils + results table; regressão enriquecido/home/insights/operacoes
- `scripts/w7-us11-validate.ps1`
- Commit `feat(portal-web): E8-US11 ...`

## Regressão obrigatória
- `/enriquecido` KPIs, preview, comparativo (E8-US06)
- Home + `EsteiraStatusCard` (E8-US10)
- Insights D-1/D-2/D-3 (E8-US07/08)
- `/operacoes` pipeline (E8-US09)
- Shell nav e auth interceptor JWT

## Commits de referência
- E8-US06: enriquecido M3 (partições, KPIs, preview, compare)
- E8-US10: b5dcc5a (esteira + ops alarms)
- Design E8-US10: 307bb39
- Design E8-US06: `aidlc-docs/construction/u8-portal-web/enriquecido/`
- E7-US01: Athena workgroup + Glue `enriquecido`
```
