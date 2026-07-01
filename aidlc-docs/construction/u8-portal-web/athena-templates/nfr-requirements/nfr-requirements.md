# NFR Requirements · U8 Portal Web Athena Templates (E8-US11)

**Story:** E8-US11  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| NFR-UX-01 | PT-BR | Templates, labels, erros em português |
| NFR-UX-02 | Sem SQL livre | Nenhum editor SQL na UI |
| NFR-UX-03 | Contexto dt | Link desde enriquecido com partição ativa |
| NFR-UX-04 | Feedback execução | Spinner RUNNING; tabela SUCCEEDED |

---

## Performance (NFR-W7-03)

| ID | Meta |
|----|------|
| NFR-PERF-01 | Mock: resultado &lt; 2s |
| NFR-PERF-02 | API Athena timeout BFF **60s** (design contrato) |
| NFR-PERF-03 | Máximo **100** linhas na UI |
| NFR-PERF-04 | HTTP client timeout portal **60s** para POST athena |

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| SECURITY-06 | Sim | JWT em `POST /athena/query-template` |
| SECURITY-03 | Sim | Não logar SQL/param payloads sensíveis |
| SECURITY-07 | Sim | Whitelist `template_id` — sem SQL injection surface no client |

### NFR-SEC-01
Frontend envia apenas `template_id` + params tipados; nunca string SQL.

### NFR-SEC-02
BFF futuro: SQL parametrizado server-side; prepared statements / bind params.

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Sim | Timeout 60s POST |
| RESILIENCY-03 | Sim | 401 → logout |

### NFR-RES-01
Falha API → mock fallback com banner informativo.

### NFR-RES-02
FAILED/CANCELLED não quebra layout; banner + limpar spinner.

---

## Property-Based Testing

| Função | Propriedade |
|--------|-------------|
| `normalizeAthenaDts` | Saída ordenada asc, sem duplicatas |
| `validateAthenaParams` | `limit` sempre ≤ 100 |
| `validateAthenaParams` | `dts.length` ∈ [2,7] quando required |
| `getTemplateById` | `undefined` para ID fora do catálogo |

---

## Extension compliance (E8-US11)

| Extension | Status |
|-----------|--------|
| Security Baseline | Compliant (design) |
| Resiliency Baseline | Compliant (design) |
| Property-Based Testing | Compliant (design) |
