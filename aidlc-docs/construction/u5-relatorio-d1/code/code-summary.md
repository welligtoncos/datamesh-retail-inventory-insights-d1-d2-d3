# Code Summary · U5 Relatório D-1 (W5)

## Entregáveis

| Artefato | Caminho |
|----------|---------|
| Lambda handler | `lambda/reports/gerar_relatorio_d1.py` |
| Excel helpers | `lambda/reports/excel_helpers.py` |
| Terraform módulo | `terraform/modules/lambda_reports/` |
| Build package | `scripts/build_lambda_d1_package.ps1` |
| Deploy + DoD | `scripts/w5-run-and-validate.ps1` |
| Baseline local E5-US03 | `scripts/generate_local_d1.py` |
| Paridade local vs S3 | `scripts/compare_d1_excel.py` |

## Decisão técnica

- **Lambda Python 3.12** — pyarrow (leitura/agregação parquet) + openpyxl (Excel com fórmulas)
- **Sem pandas no pacote Lambda** — limite 250 MB descompactado (pandas+pyarrow excedia)
- **Evento:** `data_execucao`, `dia_dado` (notebook: exec 2022-01-02, dado D-1 2022-01-01)
- **Saída:** `relatorios/D1/relatorio_D1_exec{DATA_EXECUCAO}_dado{DIA_DADO}.xlsx`
- **Entrega:** S3 apenas (E5-US02 documentado no script w5)

## Validação (2026-06-28)

- Lambda: `retail-inventory-insights-gerar-relatorio-d1-dev`
- Invoke OK: 69 produtos, 14.484 un., receita 879.026,03
- E5-US03 PARITY OK (top3: P0014, P0015, P0002)

## Execução manual

```powershell
aws lambda invoke `
  --function-name retail-inventory-insights-gerar-relatorio-d1-dev `
  --payload '{"data_execucao":"2022-01-02","dia_dado":"2022-01-01"}' `
  --cli-binary-format raw-in-base64-out `
  --region us-east-1 `
  out.json
```

## Fora de escopo (W5)

D-2/D-3, Athena, alarmes, SFN→Lambda (W6 ou extensão futura)
