# Code Summary · U6/U7 W6 (D-2, D-3, Athena, Alarmes)

## Entregáveis

| Artefato | Caminho |
|----------|---------|
| Lambda D-2 | `lambda/reports/gerar_relatorio_d2.py` |
| Lambda D-3 | `lambda/reports/gerar_relatorio_d3.py` |
| Shared utils | `lambda/reports/common.py` |
| Pacote unificado | `scripts/build_lambda_reports_package.ps1` → `lambda/build/lambda_reports.zip` |
| Terraform Lambda | `terraform/modules/lambda_reports/` (d1+d2+d3) |
| Terraform Athena | `terraform/modules/athena/` |
| Terraform monitoring | `terraform/modules/monitoring/` (SNS opcional) |
| Alarm script | `scripts/ensure-sfn-alarm.ps1` |
| Athena query | `scripts/athena-example-query.sql` |
| DoD | `scripts/w6-run-and-validate.ps1` |

## Decisões dev

- **Pacote único** pyarrow+openpyxl para D-1/D-2/D-3 (mesmo zip S3)
- **D-3 lógica mínima:** janela N dias, média úteis vs FDS, tendência 1ª vs 2ª metade (±5%)
- **Athena:** Glue catalog + partition projection; coluna `dt` só como partition key
- **Alarme SFN:** criado via CLI (`ensure-sfn-alarm.ps1`) — conta sem `cloudwatch:ListTagsForResource` para Terraform
- **SNS:** desabilitado (`enable_sns_alerts=false`) — conta sem `sns:CreateTopic`

## Validação (2026-06-28)

| Check | Resultado |
|-------|-----------|
| Lambda D-2 | OK — `relatorio_D2_exec2022-01-04_dado2022-01-03.xlsx` (0 rupturas no dia) |
| Lambda D-3 | OK — 100 pares, 3 partições, janela=3 |
| Athena | **SUCCEEDED** — top rupturas dt=2022-01-01 |
| CloudWatch alarm | OK — `retail-inventory-insights-processar-dia-failed-dev` |

## Execução manual

```powershell
aws lambda invoke --function-name retail-inventory-insights-gerar-relatorio-d2-dev `
  --payload '{"data_execucao":"2022-01-04","dia_dado":"2022-01-03"}' `
  --cli-binary-format raw-in-base64-out --region us-east-1 out.json

aws athena start-query-execution `
  --query-string file://scripts/athena-example-query.sql `
  --query-execution-context Database=retail_inventory_insights_dev `
  --work-group retail-inventory-insights-dev --region us-east-1
```
