# Application Design · U4 Orquestracao (W4)

## State machine

- **Nome:** `retail-inventory-insights-processar-dia-dev`
- **Input:** `{"dt": "YYYY-MM-DD"}`
- **Estados:** CarregarOrigem (Glue sync) → EnriquecerDia (Glue sync) → Sucesso | FalhaProcessamento

## Execução manual (dev)

```powershell
aws stepfunctions start-execution `
  --state-machine-arn $(terraform -chdir=terraform/environments/dev output -raw sfn_processar_dia_arn) `
  --input '{"dt":"2022-01-01"}' `
  --region us-east-1
```

## EventBridge (E4-US02 — opcional, dev)

- Terraform: `enable_eventbridge_schedule = false` (default)
- Cron documentado quando habilitado: `cron(0 9 * * ? *)` UTC — rule **DISABLED**
- **Dev:** execução manual com `{"dt":"YYYY-MM-DD"}` (preferido)
- dt D-1 automático requer Lambda (futuro); input manual cobre E4-US01

## Logs (E4-US03)

- `enable_sfn_logging = false` em dev (sem permissão `logs:CreateLogGroup`)
- Rastreabilidade via **Step Functions console**: execution history, input/output, `describe-execution`
- Habilitar logs: `enable_sfn_logging = true` + permissão IAM admin
