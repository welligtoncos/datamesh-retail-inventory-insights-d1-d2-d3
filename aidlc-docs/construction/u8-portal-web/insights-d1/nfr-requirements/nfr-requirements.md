# NFR Requirements · U8 Portal Web Insights D-1 (E8-US07)

**Story:** E8-US07  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| NFR-UX-01 | PT-BR | Insight, colunas, botões e mensagens em português |
| NFR-UX-02 | Insight em destaque | Card visual acima da tabela (RF-M4-07) |
| NFR-UX-03 | Valores monetários | Receita em BRL (`currency` pipe) |
| NFR-UX-04 | ≤ 3 cliques | Home → atalho D-1 → dashboard (NFR-W7-05) |
| NFR-UX-05 | Sem scroll horizontal | Tabela com scroll local (padrão E8-US06) |

---

## Performance (NFR-W7-03)

| ID | Meta |
|----|------|
| NFR-PERF-01 | Insight + ranking carregam &lt; 3s (mock) |
| NFR-PERF-02 | Download metadata &lt; 2s |
| NFR-PERF-03 | Timeout HTTP **30s** |
| NFR-PERF-04 | Ranking paginado client-side (sem cap 500 — grão produto, ~70 linhas mock) |

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| SECURITY-03 | Sim | Não logar ranking completo em produção |
| SECURITY-06 | Sim | JWT em `/insights/d1` e `/insights/d1/download` |
| SECURITY-07 | Sim | Mock sem credenciais AWS |
| NFR-W7-02 | Sim | Presigned TTL ≤ **900s**; não cachear URL no localStorage |

### NFR-SEC-01
Download abre URL presigned em nova aba; `rel="noopener noreferrer"`.

### NFR-SEC-02
Não expor bucket IAM keys no frontend; apenas URL temporária do BFF.

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Sim | Timeout 30s |
| RESILIENCY-03 | Sim | 401 → logout |

### NFR-RES-01
Falha download após insight OK → mantém insight/ranking; erro no botão download.

### NFR-RES-02
Falha API insight → fallback mock + banner.

### NFR-RES-03
Retry recarrega insight para `selectedDt`.

---

## Property-Based Testing (PBT)

### NFR-PBT-01
`aggregateD1FromEnriquecidoRows`: para qualquer conjunto de rows, `sum(ranking.unidades) === total_unidades`.

### NFR-PBT-02
`ranking` ordenado: `unidades[i] >= unidades[i+1]`.

### NFR-PBT-03
`top3_concentration_pct` em `[0, 100]`; igual a `sum(top3)/total*100`.

### NFR-PBT-04
`buildD1InsightText`: sempre contém `dt` e líder quando `total_unidades > 0`.

### NFR-PBT-05
`InsightsD1FacadeService`: 404 → mock com `partition_exists` coerente.

### NFR-PBT-06
`buildD1ReportS3Key(exec, dado)` formato fixo `relatorios/D1/relatorio_D1_exec*_dado*.xlsx`.

---

## Extension compliance (planejado)

| Extension | Status esperado |
|-----------|-----------------|
| Security Baseline | Compliant |
| Resiliency Baseline | Compliant |
| Property-Based Testing | Compliant |
