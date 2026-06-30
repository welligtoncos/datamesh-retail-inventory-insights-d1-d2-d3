# IAM · Políticas completas do Datamesh (Terraform dev)

**Conta:** `303238378103` · **Região:** `us-east-1` · **Usuário típico:** `usuario-dados`

Este pacote cobre **terraform apply** de todo o repositório:

| Onda | Módulos Terraform | Política |
|------|-------------------|----------|
| W1 | `s3`, `iam` | 01-storage, 03-iam |
| W2–W3 | `glue` | 01-storage |
| W4 | `stepfunctions`, EventBridge | 02-compute, 03-iam |
| W5–W6 | `lambda_reports` | 02-compute |
| W6 | `athena`, `monitoring` | 01-storage, 03-iam |
| W7 | `portal` | 04-portal |

---

## Políticas gerenciadas (customer managed)

| Arquivo | Nome AWS sugerido | Conteúdo |
|---------|-------------------|----------|
| `policies/01-datamesh-storage-glue-athena.json` | `Datamesh01StorageGlueAthenaDev` | S3 datamesh + portal-web, Glue Catalog/Jobs, Athena |
| `policies/02-datamesh-lambda-sfn-events.json` | `Datamesh02LambdaSfnEventsDev` | Lambda relatórios, Step Functions, EventBridge |
| `policies/03-datamesh-iam-logs-monitoring.json` | `Datamesh03IamLogsMonitoringDev` | IAM roles/policies do projeto, CloudWatch, SNS |
| `policies/04-datamesh-portal-edge.json` | `Datamesh04PortalEdgeDev` | Cognito, ECS, ALB, EC2 SG, API GW, CloudFront |

> **Não use política inline** no usuário (limite 2.048 caracteres). Use sempre **managed policies**.

---

## Instalação rápida

```powershell
# Recomendado: 2 políticas consolidadas (resolve limite 10 policies/usuário)
.\scripts\iam-attach-datamesh-policies.ps1 -IamUser usuario-dados -Mode complete

# Verificar
.\scripts\iam-verify-datamesh-policies.ps1 -IamUser usuario-dados -Mode complete
```

> **Limite AWS:** máximo **10 managed policies por usuário**. O `usuario-dados` já tinha 10 — o modo `complete` remove políticas legadas `Datamesh*` e anexa apenas 2 consolidadas.

**Somente portal W7** (sem refresh Lambda):

```powershell
.\scripts\w7-portal-apply-only.ps1
```

---

## Recursos AWS cobertos (prefixos)

| Serviço | Padrão de nome |
|---------|----------------|
| S3 datamesh | `retail-inventory-insights-dev-use1` |
| S3 portal | `retail-inventory-insights-portal-web-dev-use1` |
| Glue jobs | `retail-inventory-insights-carregar-origem-dia-dev`, `...-enriquecer-dia-dev` |
| Lambda | `retail-inventory-insights-gerar-relatorio-d{1,2,3}-dev` |
| Step Functions | `retail-inventory-insights-processar-dia-dev` |
| IAM roles | `retail-inventory-glue-dev`, `retail-inventory-lambda-reports-dev`, `retail-inventory-sfn-dev`, `rii-portal-dev-*` |
| Athena | DB `retail_inventory_insights_dev`, WG `retail-inventory-insights-dev` |
| Cognito | `rii-portal-dev-users` |

---

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| `implicitDeny` no simulate | Permissions **boundary** no usuário | Admin incluir ações na boundary ou remover |
| `lambda:GetFunction` 403 | Política 02 não anexada ou desatualizada | `iam-attach-datamesh-policies.ps1` |
| `cognito-idp:CreateUserPool` 403 | Política 04 + boundary/SCP | Verificar com admin |
| Política excede 2048 chars | Tentou inline | Usar managed policies deste pacote |

---

## Política única (alternativa)

Se o admin preferir **uma só policy**, use `datamesh-terraform-operator-dev.json` (menos granular, mais ampla em `us-east-1`).

```powershell
.\scripts\iam-attach-datamesh-policies.ps1 -Mode unified
```

---

## Roles de runtime (não confundir)

Estas políticas são para o **operador Terraform** (`usuario-dados`).  
As **task roles** (Glue, Lambda, ECS BFF) são criadas pelo próprio Terraform em `modules/iam` e `modules/portal`.
