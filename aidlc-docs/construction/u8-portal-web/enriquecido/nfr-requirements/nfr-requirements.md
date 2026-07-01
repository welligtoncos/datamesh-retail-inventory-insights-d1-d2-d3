# NFR Requirements · U8 Portal Web Enriquecido (E8-US06)

**Story:** E8-US06  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| NFR-UX-01 | PT-BR | Labels, paginator, comparativo e mensagens em português |
| NFR-UX-02 | Preview legível | Scroll horizontal em tabela 20 colunas |
| NFR-UX-03 | KPIs legíveis | Receita em BRL; contagens inteiras |
| NFR-UX-04 | Comparativo claro | Delta com cor verde/vermelho neutro (não alarmista) |

---

## Performance (NFR-W7-03)

| ID | Meta |
|----|------|
| NFR-PERF-01 | Partições carregam &lt; 2s (mock) |
| NFR-PERF-02 | KPIs + preview página &lt; 3s |
| NFR-PERF-03 | Comparativo (2× kpis) &lt; 4s |
| NFR-PERF-04 | Timeout HTTP **30s** |
| NFR-PERF-05 | Preview limitado a **500 linhas** (RF-M3-03) |

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| SECURITY-03 | Sim | Não logar preview completo em produção |
| SECURITY-06 | Sim | JWT em endpoints enriquecido |
| SECURITY-07 | Sim | Mock sem credenciais AWS |

### NFR-SEC-01
Dados de inventário retail (dataset Kaggle); sem PII adicional.

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Sim | Timeout 30s |
| RESILIENCY-03 | Sim | 401 → logout |

### NFR-RES-01
Falha preview após KPIs OK → mantém KPIs; erro no painel preview.

### NFR-RES-02
Falha comparativo → KPIs/preview intactos; mensagem na seção comparativo.

### NFR-RES-03
Retry recarrega partições + detalhe + comparativo.

---

## Property-Based Testing (PBT)

### NFR-PBT-01
`EnriquecidoFacadeService`: 404 → mock com `partitions.length >= 1`.

### NFR-PBT-02
Preview: `rows.length <= page_size` e `total_rows <= 500`.

### NFR-PBT-03
`enriquecido-compare.util`: `delta = valueB - valueA` para métricas numéricas.

### NFR-PBT-04
`DashboardService` continua passando testes após extensão de `EnriquecidoKpis`.

---

## Extension compliance (planejado)

| Extension | Status esperado |
|-----------|-----------------|
| Security Baseline | Compliant |
| Resiliency Baseline | Compliant |
| Property-Based Testing | Compliant |
