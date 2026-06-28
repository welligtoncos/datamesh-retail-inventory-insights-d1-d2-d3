# Application Design · U6/U7 W6 (D-2, D-3, Athena, Alarmes)

## Lambdas D-2 / D-3

| Relatório | Handler | Entrada | Saída S3 |
|-----------|---------|---------|----------|
| D-2 | `gerar_relatorio_d2.handler` | `data_execucao`, `dia_dado` | `relatorios/D2/relatorio_D2_exec*_dado*.xlsx` |
| D-3 | `gerar_relatorio_d3.handler` | + `janela_dias` (default 7) | `relatorios/D3/relatorio_D3_exec*_dado*.xlsx` |

Pacote único: `lambda/build/lambda_reports.zip` (D-1/D-2/D-3 + `common.py`).

### D-2 (E6-US01)
- Filtro: `_stockout == 1` AND `_lost > 0`
- Ordenação: `_lost` desc
- Grão: loja × produto (linha enriquecida)

### D-3 (E6-US02) — lógica mínima
- Lê janela de N partições `enriquecido/dt=` até `dia_dado`
- Por loja×produto: média úteis vs FDS (`_is_weekend`)
- Tendência: 1ª metade vs 2ª metade da janela (±5% → Subindo/Caindo/Estável)

## Athena (E7-US01)

- Database Glue: `retail_inventory_insights_dev`
- Tabela: `enriquecido` (partition projection `dt`)
- Workgroup: `retail-inventory-insights-dev`
- Resultados: `s3://.../athena-results/`

Query exemplo (terraform output `athena_example_query`).

Documentação completa de validação: [`scripts/athena-validation-queries.md`](../../../scripts/athena-validation-queries.md).

## Monitoramento (E7-US02)

- Alarme: `retail-inventory-insights-processar-dia-failed-dev` (metric `ExecutionsFailed` > 0)
- Script: `scripts/ensure-sfn-alarm.ps1` (Terraform não gerencia alarme nesta conta)
- SNS: opcional via `enable_sns_alerts=true` (requer IAM `sns:CreateTopic`)

## Execução manual

```powershell
aws lambda invoke --function-name retail-inventory-insights-gerar-relatorio-d2-dev `
  --payload '{"data_execucao":"2022-01-04","dia_dado":"2022-01-03"}' `
  --cli-binary-format raw-in-base64-out --region us-east-1 out.json

aws lambda invoke --function-name retail-inventory-insights-gerar-relatorio-d3-dev `
  --payload '{"data_execucao":"2022-01-04","dia_dado":"2022-01-03","janela_dias":3}' `
  --cli-binary-format raw-in-base64-out --region us-east-1 out.json
```
