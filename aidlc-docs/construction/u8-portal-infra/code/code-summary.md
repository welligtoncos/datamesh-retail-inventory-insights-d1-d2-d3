# Code Summary · U8 Portal Infra (E8-US01)

**Data:** 2026-06-29  
**Story:** E8-US01

## Artefatos gerados

| Path | Descrição |
|------|-----------|
| `terraform/modules/portal/` | Módulo Cognito, S3/CF, ECS, ALB, API GW, IAM |
| `terraform/environments/dev/main.tf` | Wiring `module.portal` |
| `terraform/environments/dev/outputs.tf` | Outputs portal_* |
| `scripts/w7-us01-validate.ps1` | Deploy + validação DoD |
| `aidlc-docs/construction/u8-portal-infra/application-design.md` | Design mínimo |

## Deploy

```powershell
.\scripts\w7-us01-validate.ps1
```

Ou manualmente:

```powershell
cd terraform/environments/dev
terraform init
terraform apply -var-file=dev.tfvars
```

## Próximo

E8-US02 — Login Cognito no Angular (`portal-web/`)
