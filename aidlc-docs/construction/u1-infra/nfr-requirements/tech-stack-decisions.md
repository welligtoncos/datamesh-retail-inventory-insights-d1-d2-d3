# Tech Stack Decisions · U1 Infra

| Decisão | Escolha | Rationale |
|---------|---------|-----------|
| Cloud | AWS us-east-1 | Decisão do projeto |
| IaC | Terraform >= 1.5 | Decisão do projeto; modular e versionável |
| AWS Provider | hashicorp/aws ~> 5.0 | Estável; suporte S3/IAM completo |
| Storage | S3 single bucket | Paridade notebook; prefixos Hive-style |
| Identity | IAM roles (3) | Preparatório Glue/Lambda/SFN |
| State backend | Local (dev) | Simplicidade; S3 backend documentado como upgrade |
| CI | Manual + terraform validate | Sem pipeline CI nesta rodada |
| Secrets | AWS credential chain | Profile/env; nada em código |

## Alternativa documentada

- **CDK Python**: equivalente funcional; não implementado nesta rodada.

## Fora de escopo W1

- Glue, Lambda, Step Functions, EventBridge, Athena, KMS CMK custom
