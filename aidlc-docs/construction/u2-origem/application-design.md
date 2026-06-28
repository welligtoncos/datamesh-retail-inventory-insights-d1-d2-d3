# Application Design · U2 Origem (mínimo)

## Componentes

| ID | Nome | Tecnologia |
|----|------|------------|
| C1 | CarregarOrigemJob | Glue Python Shell + script S3 |
| C2 | OrigemParityChecker | `scripts/compare_origem_parquet.py` |
| C3 | GlueTerraformModule | `terraform/modules/glue` |

## Fluxo

```
insumo/retail_store_inventory.csv
        → Glue Job (--dt)
        → origem/dt=YYYY-MM-DD/data.parquet
        → compare_origem_parquet.py (E2-US03)
```

## Interface job

| Argumento | Descrição |
|-----------|-----------|
| `--dt` | YYYY-MM-DD |
| `--bucket_name` | default no Terraform |

## Execução manual

```powershell
aws glue start-job-run --job-name retail-inventory-insights-carregar-origem-dia-dev `
  --arguments '{"--dt":"2022-01-01"}' --region sa-east-1
```
