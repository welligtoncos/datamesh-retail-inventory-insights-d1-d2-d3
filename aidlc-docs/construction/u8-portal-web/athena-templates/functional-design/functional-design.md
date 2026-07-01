# Functional Design · U8 Portal Web Athena Templates (E8-US11)

**Story:** E8-US11  
**Persona:** P1 · Analista de estoque  
**Data:** 2026-07-01

---

## Regras de negócio

### BR-ATH-01 · Whitelist de templates (RF-M3-05)
- Apenas `template_id` do catálogo `athena-templates.catalog.ts` (9 IDs)
- UI **não** exibe campo SQL; tooltip: “Consulta pré-aprovada”
- BFF futuro rejeita IDs desconhecidos com 400

### BR-ATH-02 · Parâmetros
| Param | Regra |
|-------|-------|
| `dt` | ISO `YYYY-MM-DD`; obrigatório onde `params_schema.dt.required` |
| `dts` | 2–7 datas; ordenar asc; deduplicar; todas em partições conhecidas |
| `limit` | Default 10 se template aceita; máximo **100** (cap portal) |

### BR-ATH-03 · Contexto de partição
- Ao abrir via link de enriquecido, pré-preencher `dt` da query `?dt=`
- Se `dt` ausente, default = partição mais recente (`enriquecido/partitions`)

### BR-ATH-04 · Resultado tabular
- Exibir `columns` + `rows` em `mat-table`
- Se `truncated === true`, chip “Resultado limitado a N linhas”
- Máximo **100** linhas retornadas ao browser (NFR-W7-03)

### BR-ATH-05 · Estados de execução
| status | UI |
|--------|-----|
| QUEUED / RUNNING | Spinner + “Executando consulta…” |
| SUCCEEDED | Tabela + metadados (`row_count`, `execution_time_ms` opcional) |
| FAILED | Banner erro PT-BR + `state_reason` se disponível |
| CANCELLED | Mensagem informativa |

### BR-ATH-06 · Mock fallback (NFR-W7-04)
- Falha API → mock `SUCCEEDED` com dados alinhados a `enriquecido-mock.data.ts`
- Chip “Dados de demonstração”
- `partition_sanity` para `2022-01-01`: 100 linhas, receita 879026.03

### BR-ATH-07 · Sem SQL livre
- Fase 2 apenas; esta story bloqueia qualquer input de query string

### BR-ATH-08 · Integração enriquecido
- Link “Consultas Athena” visível quando ≥1 partição (ou mock)
- Voltar para `/enriquecido?dt=` preserva seleção

---

## Casos de teste (checklist E8-US11)

| # | Cenário | Resultado |
|---|---------|-----------|
| T1 | Mock `partition_sanity` dt=2022-01-01 | 100 linhas, receita 879026.03 |
| T2 | Mock `d1_totals` | 69 produtos, 14484 unidades |
| T3 | `dts` com 1 item | Form inválido; POST bloqueado |
| T4 | `template_id` inválido | Erro frontend antes do POST |
| T5 | Link enriquecido → athena | `dt` pré-preenchido |
| T6 | `/enriquecido` regressão | KPIs/preview/compare OK |
| T7 | Sem textarea SQL | Nenhum campo SQL na UI |

---

## Mensagens PT-BR

| Situação | Mensagem |
|----------|----------|
| Params inválidos | Preencha a partição (dt) antes de executar. |
| Athena FAILED | A consulta falhou. Verifique a partição ou tente novamente. |
| Timeout (futuro) | A consulta excedeu o tempo limite (60s). |
| Mock | Exibindo dados de demonstração até o BFF estar disponível. |
| Truncated | Resultado limitado — refine filtros ou use outro template. |
