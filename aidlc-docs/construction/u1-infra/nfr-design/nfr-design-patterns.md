# NFR Design Patterns · U1 Infra

## Security Patterns

### Defense in depth (storage)
1. Block Public Access (4 flags)
2. SSE-S3 default encryption
3. Bucket policy deny non-TLS
4. IAM prefix-scoped policies (separate read/write statements)

### Least privilege IAM
- Trust policy: single service principal per role
- Resource ARNs: `${bucket_arn}`, `${bucket_arn}/prefix/*`
- Actions: explicit list (no `s3:*`, no `iam:*`)

## Scalability Patterns

- **Prefix partitioning**: `origem/dt=` e `enriquecido/dt=` — escala horizontal por dia (W2+)
- **Single bucket**: suficiente dev; separação lógica por prefix

## Reliability Patterns

- **IaC idempotency**: Terraform declarative state
- **Placeholder objects**: `.keep` em cada prefix para visibilidade operacional

## Performance Patterns

- N/A compute W1
- S3 Standard storage class (default)

## Resilience Patterns

- N/A (Resiliency extension disabled for dev W1)

## Monitoring Patterns (preparatório)

- SFN role inclui CloudWatch Logs permissions scoped (W4)
- Alarmes: W6 (E7-US02)
