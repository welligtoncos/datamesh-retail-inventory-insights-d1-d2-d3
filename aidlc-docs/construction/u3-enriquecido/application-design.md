# Application Design · U3 Enriquecido (W3)

## Fluxo

```
origem/dt={dt}/data.parquet
    → Glue enriquecer_dia (Python Shell 3.9)
    → enriquecido/dt={dt}/data.parquet
    → compare_enriquecido_parquet.py (E3-US03)
```

## Job Glue

- **Nome:** `retail-inventory-insights-enriquecer-dia-dev`
- **Args:** `--dt`, `--bucket_name`
- **Módulos:** `pandas==2.2.3`, `pyarrow==18.1.0`, `numpy`

## Execução manual

```powershell
aws glue start-job-run `
  --job-name retail-inventory-insights-enriquecer-dia-dev `
  --arguments '{"--dt":"2022-01-01"}' `
  --region us-east-1
```

## Pré-requisito

Partição `origem/dt={dt}/` deve existir (W2).
