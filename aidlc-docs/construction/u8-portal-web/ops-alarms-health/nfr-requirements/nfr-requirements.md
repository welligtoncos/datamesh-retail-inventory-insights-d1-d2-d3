# NFR Requirements · U8 Portal Web Ops Alarms + Health (E8-US10)

**Story:** E8-US10  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| NFR-UX-01 | PT-BR | Card esteira e tooltips em português |
| NFR-UX-02 | Visibilidade | Card acima dos KPIs na home |
| NFR-UX-03 | Cores acessíveis | Verde/vermelho/âmbar + ícone (não só cor) |
| NFR-UX-04 | Dupla superfície | Shell = API; Home = esteira (sem confundir) |

---

## Performance (NFR-W7-03)

| ID | Meta |
|----|------|
| NFR-PERF-01 | Card status &lt; 3s (mock) |
| NFR-PERF-02 | Poll 60s (não &lt; 30s) |
| NFR-PERF-03 | Timeout HTTP 30s |

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| SECURITY-06 | Sim | JWT em `/ops/alarms`; `/health` público |
| SECURITY-07 | Sim | Mock sem credenciais AWS |
| SECURITY-03 | Sim | Não logar ARNs em produção build |

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Sim | Timeout 30s |
| RESILIENCY-03 | Sim | 401 → logout |

### NFR-RES-01
Falha `/ops/alarms` não remove KPIs da home (card cai em mock).

### NFR-RES-02
Falha health já tratada — card mostra `api_offline` sem crash.

### NFR-RES-03
Poll cancelado em `ngOnDestroy` do card.

---

## Property-Based Testing

| Função | Propriedade |
|--------|-------------|
| `deriveEsteiraStatus` | Determinístico para pares (health, alarm) |
| `deriveEsteiraStatus` | `api_offline` sempre vence `operational` |
| `pipeline_operational` mock | `true` iff primary state `OK` |

---

## Extension compliance (E8-US10)

| Extension | Status |
|-----------|--------|
| Security Baseline | Compliant (design) |
| Resiliency Baseline | Compliant (design) |
| Property-Based Testing | Compliant (design) |
