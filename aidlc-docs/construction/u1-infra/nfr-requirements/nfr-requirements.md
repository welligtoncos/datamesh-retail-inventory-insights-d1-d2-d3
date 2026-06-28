# NFR Requirements · U1 Infra S3/IAM

**Unidade:** u1-infra · **Onda:** W1 · **Ambiente:** dev · **Região:** us-east-1

---

## Scalability

| ID | Requisito | Valor W1 |
|----|-----------|----------|
| SCL-01 | Carga esperada | Batch diário; CSV ~73k linhas; parquet por dia |
| SCL-02 | Crescimento | Partições `dt=` incrementais; sem limite hard em dev |
| SCL-03 | Compute | N/A nesta rodada (sem Glue/Lambda) |

## Performance

| ID | Requisito | Valor W1 |
|----|-----------|----------|
| PERF-01 | Latência S3 | Padrão regional us-east-1 |
| PERF-02 | Throughput | Suficiente para upload CSV único e parquet diário |

## Availability

| ID | Requisito | Valor W1 |
|----|-----------|----------|
| AVL-01 | Uptime S3 | SLA AWS S3 (11 9s durabilidade) |
| AVL-02 | Multi-AZ | S3 regional; sem replicação cross-region em dev |
| AVL-03 | DR | N/A dev; backup manual CSV se necessário |

## Security (Security Baseline — enabled)

| ID | Requisito | Implementação |
|----|-----------|---------------|
| SEC-01 | Encryption at rest | SSE-S3 AES256 (SECURITY-01) |
| SEC-02 | Encryption in transit | Bucket policy `aws:SecureTransport = true` (SECURITY-01) |
| SEC-03 | Public access | Block Public Access habilitado (SECURITY-09) |
| SEC-04 | IAM least privilege | Policies scoped por bucket ARN + prefix (SECURITY-06) |
| SEC-05 | Tags custo/ambiente | Project, Environment, ManagedBy |
| SEC-06 | Secrets | Nenhum secret em Terraform; credenciais via AWS CLI/profile |

## Reliability

| ID | Requisito | Valor W1 |
|----|-----------|----------|
| REL-01 | Idempotência Terraform | `terraform apply` reproduzível |
| REL-02 | Versioning S3 | Disabled em dev (custo) |

## Maintainability

| ID | Requisito | Valor W1 |
|----|-----------|----------|
| MNT-01 | IaC modular | `modules/s3`, `modules/iam`, `environments/dev` |
| MNT-02 | Outputs documentados | bucket_name, ARNs roles, prefixos |
| MNT-03 | State | Local backend dev; S3 backend opcional comentado |

## Usability (operacional)

| ID | Requisito | Valor W1 |
|----|-----------|----------|
| USE-01 | Upload CSV | Comando `aws s3 cp` documentado |
| USE-02 | Mapa analista | Tabela local→S3 em README terraform |

---

## Security Compliance Summary (NFR stage)

| Rule | Status | Notes |
|------|--------|-------|
| SECURITY-01 | Compliant | SSE-S3 + TLS-only bucket policy |
| SECURITY-02 | N/A | Sem LB/API Gateway |
| SECURITY-03 | N/A | Sem app deployada |
| SECURITY-04 | N/A | Sem web app |
| SECURITY-05 | N/A | Sem API |
| SECURITY-06 | Compliant | IAM scoped; no `*` on sensitive S3 actions |
| SECURITY-07 | N/A | Sem VPC/SG nesta unidade |
| SECURITY-08–15 | N/A | Infra-only W1 |
