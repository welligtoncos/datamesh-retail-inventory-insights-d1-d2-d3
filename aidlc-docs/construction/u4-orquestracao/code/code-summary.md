# Code Summary · U4 Orquestracao (W4)

## Entregáveis

| Artefato | Caminho |
|----------|---------|
| State machine | `terraform/modules/stepfunctions/processar_dia.asl.json.tpl` |
| Terraform módulo | `terraform/modules/stepfunctions/` |
| IAM PassRole Glue | `terraform/modules/iam/main.tf` |
| Deploy + DoD | `scripts/w4-run-and-validate.ps1` |

## Decisão técnica

- **Step Functions STANDARD** com `glue:startJobRun.sync` (origem → enriquecido)
- **ResultPath** preserva `dt` entre estados Glue
- **Retry:** 2 tentativas, backoff 2x, intervalo 30s
- **EventBridge:** opcional via `enable_eventbridge_schedule=false` (default dev)
- **CloudWatch Logs SFN:** opcional via `enable_sfn_logging=false` (conta sem `logs:CreateLogGroup`)

## Validação (2026-06-28)

- SFN: `retail-inventory-insights-processar-dia-dev`
- 3 execuções **SUCCEEDED**: dt=2022-01-01, 2022-01-02, 2022-01-03
- S3 origem + enriquecido presentes para cada dt

## Execução manual

```powershell
aws stepfunctions start-execution `
  --state-machine-arn arn:aws:states:us-east-1:303238378103:stateMachine:retail-inventory-insights-processar-dia-dev `
  --input '{"dt":"2022-01-01"}' `
  --region us-east-1
```

## Fora de escopo (W4)

Lambda Excel (W5)
