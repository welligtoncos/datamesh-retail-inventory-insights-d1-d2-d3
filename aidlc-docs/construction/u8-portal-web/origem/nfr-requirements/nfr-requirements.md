# NFR Requirements · U8 Portal Web Origem (E8-US05)

**Story:** E8-US05  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| NFR-UX-01 | PT-BR | Labels, paginator e mensagens em português |
| NFR-UX-02 | Preview legível | Scroll horizontal em tabela 15 colunas |
| NFR-UX-03 | Seleção clara | dt ativa destacada na lista |

---

## Performance (NFR-W7-03)

| ID | Meta |
|----|------|
| NFR-PERF-01 | Partições carregam &lt; 2s (mock) |
| NFR-PERF-02 | Preview página &lt; 3s |
| NFR-PERF-03 | Timeout HTTP **30s** |
| NFR-PERF-04 | Preview limitado a **500 linhas** (RF-M2-03) |

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| SECURITY-03 | Sim | Não logar linhas completas do preview em produção |
| SECURITY-06 | Sim | JWT em endpoints origem |
| SECURITY-07 | Sim | Mock sem credenciais AWS |

### NFR-SEC-01
Preview exibe apenas dados agregados de inventário (sem PII adicional além do dataset público Kaggle).

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Sim | Timeout 30s |
| RESILIENCY-03 | Sim | 401 → logout |

### NFR-RES-01
Falha preview após partições OK → mantém lista; mensagem erro no painel direito.

### NFR-RES-02
Retry recarrega partições + preview da dt selecionada.

---

## Property-Based Testing (PBT)

### NFR-PBT-01
`OrigemFacadeService`: 404 → mock com `partitions.length >= 1`.

### NFR-PBT-02
Preview response: `rows.length <= page_size` e `page >= 1`.

### NFR-PBT-03
`total_rows <= 500` para qualquer resposta mock/API.

---

## Extension compliance (planejado)

| Extension | Status esperado |
|-----------|-----------------|
| Security Baseline | Compliant |
| Resiliency Baseline | Compliant |
| Property-Based Testing | Compliant |
