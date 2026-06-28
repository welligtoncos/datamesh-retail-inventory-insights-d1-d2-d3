# Code Summary · U3 Enriquecido (W3)

## Entregáveis

| Artefato | Caminho |
|----------|---------|
| Glue job (Python Shell) | `glue/jobs/enriquecer_dia.py` |
| Terraform (extensão módulo Glue) | `terraform/modules/glue/` |
| Wire dev + outputs | `terraform/environments/dev/` |
| Deploy + DoD | `scripts/w3-run-and-validate.ps1` |
| Baseline local E3-US03 | `scripts/generate_local_enriquecido.py` |
| Paridade local vs S3 | `scripts/compare_enriquecido_parquet.py` |

## Decisão técnica

- **Glue Python Shell 3.9** — lê `origem/dt=`, grava `enriquecido/dt=` (idempotente).
- **Módulos:** `pandas==2.2.3`, `pyarrow==18.1.0`, `numpy`.

## Validação (2026-06-28)

- Job: `retail-inventory-insights-enriquecer-dia-dev`
- Run: `jr_db4cb56d2f3a43c454ed381bfddfd55e8b34e7e622bed4b369272325edeb5140` — **SUCCEEDED**
- S3: `s3://retail-inventory-insights-dev-use1/enriquecido/dt=2022-01-01/data.parquet`
- E3-US03: **100 rows**, stockout_pct=0.0%, revenue_sum=879,026.03 — PARITY OK

## Fora de escopo (W3)

Step Functions, EventBridge, Lambda Excel (W4+)
