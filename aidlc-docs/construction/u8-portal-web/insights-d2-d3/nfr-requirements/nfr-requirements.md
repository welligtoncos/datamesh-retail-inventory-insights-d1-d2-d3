# NFR Requirements · U8 Portal Web Insights D-2 e D-3 (E8-US08)

**Story:** E8-US08  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| NFR-UX-01 | PT-BR | Colunas, chips, janela e mensagens em português |
| NFR-UX-02 | D-2 priorização | Maior `_lost` no topo da tabela |
| NFR-UX-03 | D-3 classificação visual | Chips Subindo/Caindo/Estável distinguíveis |
| NFR-UX-04 | ≤ 3 cliques | Home → atalho D-2 ou D-3 (NFR-W7-05) |
| NFR-UX-05 | Sem overflow horizontal | Scroll local nas tabelas |

---

## Performance (NFR-W7-03)

| ID | Meta |
|----|------|
| NFR-PERF-01 | D-2 insight &lt; 3s (mock) |
| NFR-PERF-02 | D-3 janela 7d &lt; 4s (mock, 2 partições) |
| NFR-PERF-03 | Timeout HTTP **30s** |
| NFR-PERF-04 | D-3 window max UI **14** dias (evitar payload excessivo no mock) |

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| SECURITY-03 | Sim | Não logar tabelas completas |
| SECURITY-06 | Sim | JWT em `/insights/d2`, `/insights/d3`, downloads |
| SECURITY-07 | Sim | Mock sem credenciais AWS |
| NFR-W7-02 | Sim | Presigned TTL ≤ **900s** |

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Sim | Timeout 30s |
| RESILIENCY-03 | Sim | 401 → logout |

### NFR-RES-01
Falha download mantém insight/tabela visíveis.

### NFR-RES-02
Falha API → fallback mock D-2/D-3 independente.

### NFR-RES-03
Alterar janela N em D-3 não quebra estado do seletor dt.

---

## Property-Based Testing (PBT)

### NFR-PBT-01
`filterRupturas`: toda row tem `_stockout===1` e `lost>0`; ordenação `_lost` desc.

### NFR-PBT-02
`filterRupturas`: `total_lost === sum(rows.lost)`.

### NFR-PBT-03
`computeTrends`: `trend_label` consistente com `trend_pct` e limiar ±5.

### NFR-PBT-04
`computeTrends`: `subindo + caindo + estavel === rows.length`.

### NFR-PBT-05
Facades: 404 → mock com `data_source: mock`.

### NFR-PBT-06
Refactor D-1 shared: testes D-1 existentes continuam passando.

---

## Extension compliance (planejado)

| Extension | Status esperado |
|-----------|-----------------|
| Security Baseline | Compliant |
| Resiliency Baseline | Compliant |
| Property-Based Testing | Compliant |
