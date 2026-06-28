# Code Summary · U2 Origem (W2)

## Entregáveis

| Artefato | Caminho |
|----------|---------|
| Glue job (Python Shell) | `glue/jobs/carregar_origem_dia.py` |
| Terraform módulo Glue | `terraform/modules/glue/` |
| Wire dev | `terraform/environments/dev/main.tf` |
| IAM glue/scripts | `terraform/modules/iam/main.tf` |
| Deploy + DoD | `scripts/w2-run-and-validate.ps1` |
| Baseline local E2-US03 | `scripts/generate_local_origem.py` |
| Paridade local vs S3 | `scripts/compare_origem_parquet.py` |

## Decisão técnica

- **Glue Python Shell 3.9** (não PySpark): paridade com notebook pandas/pyarrow — arquivo único `data.parquet` por partição.
- **Args:** `--dt`, `--bucket_name` (default via Terraform).
- **Módulos adicionais:** `pandas==2.2.3`, `pyarrow==18.1.0`.

## Validação (2026-06-28)

- Job: `retail-inventory-insights-carregar-origem-dia-dev`
- Run: `jr_ec02216e3d6a1b0a6a318506242aa360be0bf99d7dabe60fa2e3b4687016f14b` — **SUCCEEDED**
- S3: `s3://retail-inventory-insights-dev/origem/dt=2022-01-01/data.parquet` (12 742 bytes)
- Paridade E2-US03: **100 rows, 15 cols** — `compare_origem_parquet.py` OK

## Fora de escopo (W2)

- `enriquecer_dia`, Step Functions, EventBridge, Lambda relatórios (W3+)
