# Application Design · U5 Relatório D-1 (W5)

## Fluxo

```
enriquecido/dt={DIA_DADO}/data.parquet
    → Lambda gerar_relatorio_d1 (Python 3.12 + openpyxl)
    → relatorios/D1/relatorio_D1_exec{DATA_EXECUCAO}_dado{DIA_DADO}.xlsx
    → compare_d1_excel.py (E5-US03)
```

## Lambda

- **Nome:** `retail-inventory-insights-gerar-relatorio-d1-dev`
- **Evento:** `data_execucao`, `dia_dado` (ou `dt` = DIA_DADO; execução = dt+1)
- **Env:** `BUCKET_NAME`
- **Deps:** openpyxl + pyarrow (zip Linux; sem pandas — limite 250 MB Lambda)

## Semântica D-1 (notebook §3)

| Campo | Exemplo | Significado |
|-------|---------|-------------|
| `DATA_EXECUCAO` | 2022-01-02 | Quando a esteira roda |
| `DIA_DADO` | 2022-01-01 | Partição enriquecido (D-1) |

## Execução manual

```powershell
aws lambda invoke `
  --function-name retail-inventory-insights-gerar-relatorio-d1-dev `
  --payload '{"data_execucao":"2022-01-02","dia_dado":"2022-01-01"}' `
  --cli-binary-format raw-in-base64-out `
  --region us-east-1 `
  out.json
```

## Acesso analista (E5-US02)

```powershell
aws s3 cp s3://retail-inventory-insights-dev-use1/relatorios/D1/relatorio_D1_exec2022-01-02_dado2022-01-01.xlsx . --region us-east-1
```

Console S3: bucket → prefixo `relatorios/D1/`.

## Pré-requisito

Partição `enriquecido/dt={DIA_DADO}/` (W3/W4).

## Fora de escopo (W5)

D-2/D-3, Athena, alarmes, integração SFN→Lambda (W6 ou extensão futura).
