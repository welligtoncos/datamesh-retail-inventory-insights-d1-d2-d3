# NFR Requirements · U8 Portal API (E8-US12)

**Story:** E8-US12  
**Data:** 2026-07-01  
**Extensions:** Security Baseline · Resiliency Baseline · Property-Based Testing

---

## Segurança (NFR-W7-01 · Security Baseline)

| ID | Requisito | Critério |
|----|-----------|----------|
| SEC-01 | JWT no perímetro | API GW valida Cognito; rotas protegidas exceto `/health` |
| SEC-02 | IAM least privilege | Task role E8-US01 — sem permissões extras no BFF |
| SEC-03 | Sem SQL injection | Athena: apenas template whitelist + bind params |
| SEC-04 | Presigned curto | TTL ≤ 900s (NFR-W7-02) |
| SEC-05 | Logs sem PII | Não logar JWT completo; mascarar `sub` parcial se necessário |
| SEC-06 | HTTPS | API GW + CloudFront TLS only (infra existente) |
| SEC-07 | Secrets | Sem credenciais em código; IAM role ECS |

### Security Baseline compliance (design)

| Rule | Status | Notas |
|------|--------|-------|
| SECURITY-01 Encryption | N/A | BFF não persiste dados; S3/ECS já encrypted |
| SECURITY-02 Access logging | Compliant | API GW logging opcional E8-US01; habilitar em dev se `enable_portal_logging` |
| SECURITY-03 App logging | Planned | structlog JSON → CloudWatch via ECS |
| SECURITY-04 HTTP headers | N/A | Headers no CloudFront (SPA), não no BFF JSON API |
| SECURITY-05 AuthN/Z | Compliant | Cognito JWT no API GW |

---

## Performance (NFR-W7-03)

| ID | Requisito | Valor |
|----|-----------|-------|
| PERF-01 | Preview max rows/page | `page_size` ≤ 500 |
| PERF-02 | API timeout geral | 30s (ALB idle) |
| PERF-03 | Athena poll timeout | 60s |
| PERF-04 | Athena max rows UI | 100 + `truncated` |
| PERF-05 | Parquet read | Single file per dt; streaming pyarrow |
| PERF-06 | Fargate sizing | 0.25 vCPU / 512 MiB (dev) |

---

## Resiliência (NFR-W7-04 · Resiliency Baseline)

| ID | Requisito | Implementação |
|----|-----------|---------------|
| RES-01 | Health check | `GET /health` para ALB target |
| RES-02 | boto3 retry | `Config(retries={'max_attempts': 3, 'mode': 'standard'})` |
| RES-03 | Graceful degradation | Erros AWS → 503 com mensagem PT-BR |
| RES-04 | Stateless | Sem sessão servidor; escala horizontal futura |
| RES-05 | Idempotência leitura | GET safe; POST pipeline documentado como não-idempotente |

---

## Manutenibilidade (NFR-W7-06)

| ID | Requisito | Implementação |
|----|-----------|---------------|
| MAINT-01 | OpenAPI | FastAPI `/docs`, `/redoc` |
| MAINT-02 | PBT | hypothesis em `domain/*` |
| MAINT-03 | Type hints | Python 3.12 + Pydantic v2 |
| MAINT-04 | Contrato frontend | Schemas espelham TypeScript models |

---

## Custo (NFR-W7-07)

| ID | Requisito | Notas |
|----|-----------|-------|
| COST-01 | Fargate mínimo | 1 task dev |
| COST-02 | Athena | Queries sob demanda; resultados em prefix existente |
| COST-03 | Sem cache Redis | Fora de escopo dev |

---

## Usabilidade API (indireta — RF-M7-03)

| ID | Requisito |
|----|-----------|
| UX-01 | Mensagens erro `detail` em português |
| UX-02 | Códigos estáveis `code` para diagnóstico |

---

## Extension summary

| Extension | Aplicável | Blocking items |
|-----------|-----------|----------------|
| Security Baseline | Sim | Nenhum no design — logging ECS planejado Part 2 |
| Resiliency Baseline | Sim | Health + retries documentados |
| Property-Based Testing | Sim | PBT em agregações D-1/D-2/D-3 |
