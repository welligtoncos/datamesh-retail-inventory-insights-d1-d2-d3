# Technology Stack

## Programming Languages

- **Python 3.13** — Linguagem principal (notebook, transformações, Excel)

## Frameworks

- **Jupyter / ipykernel** — Execução interativa do notebook
- **pandas 2.x** — Manipulação tabular e agregações
- **numpy 2.x** — Operações numéricas
- **openpyxl 3.x** — Geração de relatórios Excel
- **pyarrow 18–21** — Formato Parquet particionado

## Infrastructure (local)

- **Filesystem** — CSV, Parquet Hive-style, XLSX
- **Python venv** — Isolamento de dependências

## Infrastructure (alvo AWS — referência)

- **S3** — insumo, origem, enriquecido, relatórios (W1)
- **Glue Job** — enriquecimento em escala (W3+)
- **Lambda** — disparo e Excel (W4–W5)
- **Step Functions** — orquestração `processar_dia` (W4)
- **EventBridge** — cron diário (W4)
- **Athena** — consulta SQL (W6)

## Build Tools

- **pip** — Instalação via `requirements.txt`
- **Terraform** — IaC escolhido para W1 (decisão do projeto)

## Testing Tools

- Nenhum framework de teste configurado
- Validação manual via sanidade §1 e comparação visual de outputs
