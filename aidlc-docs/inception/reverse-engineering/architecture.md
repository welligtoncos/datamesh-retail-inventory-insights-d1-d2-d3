# System Architecture

## System Overview

Sistema brownfield monolítico em Jupyter Notebook (Python 3.13) que implementa uma esteira de dados de estoque varejo com processamento incremental por partição diária e geração de relatório Excel D-1. Não há serviços distribuídos, APIs REST ou infraestrutura AWS no repositório atual — apenas simulação local com equivalência documentada para S3, Glue, Lambda, Step Functions e EventBridge.

## Architecture Diagram

```mermaid
flowchart TB
    subgraph Notebook["Esteira_3Relatorios_D1_D2_D3.ipynb"]
        S0["§0 Setup<br/>pandas, numpy, openpyxl"]
        S1["§1 Insumo<br/>SCHEMA + sanidade"]
        S2["§2 Incremental<br/>carregar_origem_dia<br/>enriquecer_dia<br/>processar_dia"]
        S3["§3 Relatório D-1<br/>Excel + insight"]
    end

    subgraph Storage["Armazenamento local"]
        CSV["retail_store_inventory.csv"]
        TO["tabela_origem/dt=/data.parquet"]
        TE["tabela_enriquecida/dt=/data.parquet"]
        XL["relatorio_D1_exec*_dado*.xlsx"]
    end

    S0 --> S1
    S1 --> CSV
    S1 --> S2
    S2 --> TO
    S2 --> TE
    S3 --> TE
    S3 --> XL
```

## Component Descriptions

### Notebook principal
- **Purpose**: Orquestração e transformação end-to-end em células sequenciais.
- **Responsibilities**: Validação, particionamento, enriquecimento, agregação D-1, export Excel.
- **Dependencies**: pandas, numpy, pyarrow, openpyxl.
- **Type**: Application

### Camada origem (tabela_origem)
- **Purpose**: Snapshot diário filtrado do insumo.
- **Responsibilities**: Parquet por `dt=`; overwrite idempotente.
- **Dependencies**: insumo CSV, pyarrow.
- **Type**: Application / Data Store (local)

### Camada enriquecida (tabela_enriquecida)
- **Purpose**: Dados de negócio calculados por linha.
- **Responsibilities**: Métricas `_revenue`, `_stockout`, `_lost`, `_is_weekend`, `dt`.
- **Dependencies**: tabela_origem.
- **Type**: Application / Data Store (local)

### Relatório D-1
- **Purpose**: Entrega analítica para P1 (analista de estoque).
- **Responsibilities**: Agregação produto+categoria; insight automático; fórmulas Excel.
- **Dependencies**: tabela_enriquecida.
- **Type**: Application / Output

## Data Flow

```mermaid
sequenceDiagram
    participant CSV as retail_store_inventory.csv
    participant CO as carregar_origem_dia
    participant EO as enriquecer_dia
    participant PD as processar_dia
    participant R1 as Relatório D-1

    CSV->>CO: filtrar Date == dt
    CO->>CO: gravar tabela_origem/dt=/data.parquet
    CO->>EO: partição origem
    EO->>EO: calcular _revenue, _stockout, _lost, _is_weekend
    EO->>EO: gravar tabela_enriquecida/dt=/data.parquet
    PD->>CO: invocar
    PD->>EO: invocar
    R1->>EO: ler partição DIA_DADO
    R1->>R1: agregar + Excel
```

## Integration Points

- **External APIs**: Nenhuma — dataset estático CSV (Kaggle).
- **Databases**: Nenhum — arquivos CSV/Parquet/Excel locais.
- **Third-party Services**: Nenhum no estado atual.

## Infrastructure Components

- **CDK Stacks**: Nenhum no repositório.
- **Terraform**: Nenhum no repositório (alvo W1).
- **Deployment Model**: Execução manual via Jupyter kernel `.venv`.
- **Networking**: N/A (local).
