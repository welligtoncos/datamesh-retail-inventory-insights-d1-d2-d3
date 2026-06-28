# NFR Requirements · U5 Relatório D-1 (W5)

**Unidade:** u5-relatorio-d1 · **Onda:** W5 · **Ambiente:** dev · **Região:** us-east-1

---

## Performance

| ID | Requisito | Valor W5 |
|----|-----------|----------|
| PERF-01 | Tempo Lambda | < 60s para ~100 linhas agregadas |
| PERF-02 | Memória | 512 MB (pandas + openpyxl) |

## Security

| ID | Requisito | Valor W5 |
|----|-----------|----------|
| SEC-01 | IAM least privilege | Role `lambda-reports-dev`: read `enriquecido/*`, write `relatorios/*` |
| SEC-02 | Dados em trânsito | TLS S3/Lambda padrão AWS |

## Reliability

| ID | Requisito | Valor W5 |
|----|-----------|----------|
| REL-01 | Idempotência | Re-invoke sobrescreve mesmo `.xlsx` (mesmo naming) |
| REL-02 | Falha explícita | Erro se partição enriquecido ausente |

## Entrega

| ID | Requisito | Valor W5 |
|----|-----------|----------|
| ENT-01 | Canal | S3 apenas (default dev) |
| ENT-02 | Path fixo | `relatorios/D1/` |
