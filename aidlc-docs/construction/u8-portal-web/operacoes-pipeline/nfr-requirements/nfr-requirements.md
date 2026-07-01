# NFR Requirements · U8 Portal Web Operações Pipeline (E8-US09)

**Story:** E8-US09  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| NFR-UX-01 | PT-BR | Botões, tabela, diálogos e status em português |
| NFR-UX-02 | Deep-link | `?dt=` pré-preenche seletor em ≤ 1 clique do banner |
| NFR-UX-03 | Status visual | Chips RUNNING (azul), SUCCEEDED (verde), FAILED (vermelho) |
| NFR-UX-04 | Feedback disparo | Loading no botão durante POST |
| NFR-UX-05 | Responsivo | Tabela com scroll horizontal em mobile |

---

## Performance (NFR-W7-03)

| ID | Meta |
|----|------|
| NFR-PERF-01 | POST processar-dia feedback UI &lt; 2s (mock) |
| NFR-PERF-02 | Lista 20 execuções &lt; 3s |
| NFR-PERF-03 | Timeout HTTP **30s** |
| NFR-PERF-04 | Polling intervalo **15s** (não menor que 10s) |

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| SECURITY-03 | Sim | Não logar execution_arn em console em produção build |
| SECURITY-06 | Sim | JWT obrigatório em POST/GET pipeline (exceto health) |
| SECURITY-07 | Sim | Mock sem credenciais AWS embutidas |
| RF-M6-04 | Sim | `sub` Cognito apenas via BFF; frontend exibe audit retornado |

### NFR-SEC-01
Desabilitar botão Processar se usuário não autenticado (AuthGuard já protege rota).

### NFR-SEC-02
Não expor IAM keys no frontend; StartExecution somente no BFF (E8-US12).

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Sim | Timeout 30s nas chamadas pipeline |
| RESILIENCY-03 | Sim | 401 → fluxo logout existente |

### NFR-RES-01
Falha no polling não remove histórico já carregado.

### NFR-RES-02
Falha API → fallback mock independente por operação (list vs start).

### NFR-RES-03
`destroy` da página cancela interval de polling (evitar memory leak).

### NFR-RES-04
Duplo clique no botão Processar não envia POST duplicado (debounce/disable).

---

## Property-Based Testing (PBT)

| Função pura | Propriedade |
|-------------|-------------|
| `normalizePipelineDt` | Saída sempre `YYYY-MM-DD` ou throw |
| `computeDurationSeconds` | `duration >= 0`; null se `stopped` ausente |
| Mock store ordering | Após insert, lista ordenada por `started_at` desc |

---

## Extension compliance (E8-US09)

| Extension | Status | Rationale |
|-----------|--------|-----------|
| Security Baseline | **Compliant** (design) | JWT, audit via BFF, sem secrets |
| Resiliency Baseline | **Compliant** (design) | Polling cleanup, fallback mock |
| Property-Based Testing | **Compliant** (design) | Utils puras com specs PBT |
| RF-M5-04 Alarmes | **N/A** | E8-US10 |
| RF-M5-05 Health badge | **N/A** | Já na home; alarme E8-US10 |
