# API Documentation

## REST APIs

Nenhuma API REST exposta. O sistema é um notebook batch local.

## Internal APIs

### carregar_origem_dia(dt)
- **Methods**: `carregar_origem_dia(dt: Timestamp | str | date) -> DataFrame`
- **Parameters**: `dt` — dia a extrair do insumo (normalizado para meia-noite)
- **Return Types**: DataFrame com linhas do dia; grava `tabela_origem/dt={dt}/data.parquet`
- **Errors**: `ValueError` se não houver dados para o dia

### enriquecer_dia(dt)
- **Methods**: `enriquecer_dia(dt) -> DataFrame`
- **Parameters**: `dt` — partição origem a enriquecer
- **Return Types**: DataFrame enriquecido; grava `tabela_enriquecida/dt={dt}/data.parquet`
- **Side effects**: Adiciona colunas `_revenue`, `_stockout`, `_lost`, `_is_weekend`, `dt`

### ler_enriquecido()
- **Methods**: `ler_enriquecido() -> DataFrame`
- **Parameters**: Nenhum
- **Return Types**: Concatenação de todas as partições `dt=*/data.parquet` ou DataFrame vazio

### processar_dia(dt)
- **Methods**: `processar_dia(dt) -> DataFrame`
- **Parameters**: `dt` — dia a processar end-to-end
- **Return Types**: Tabela enriquecida acumulada após origem + enriquecimento

### _part(base, dt)
- **Methods**: `_part(base: Path, dt) -> Path`
- **Parameters**: `base` — diretório raiz; `dt` — data da partição
- **Return Types**: Path `base/dt=YYYY-MM-DD`

## Data Models

### SCHEMA (insumo)
- **Fields**: Date, Store ID, Product ID, Category, Region, Inventory Level, Units Sold, Units Ordered, Demand Forecast, Price, Discount, Weather Condition, Holiday/Promotion, Competitor Pricing, Seasonality
- **Relationships**: Chave natural Date + Store ID + Product ID
- **Validation**: Lista `SCHEMA` obrigatória; parse_dates em Date

### Colunas enriquecidas
- **Fields**:
  - `_revenue`: Units Sold × Price (2 decimais)
  - `_stockout`: int 0/1 — `(Units Sold >= Inventory Level) AND (Demand Forecast > Inventory Level)`
  - `_lost`: se `_stockout==1`, `(Demand Forecast - Units Sold).clip(lower=0)` senão 0
  - `_is_weekend`: int 0/1 — weekday >= 5
  - `dt`: string `YYYY-MM-DD`
- **Relationships**: 1:1 com linha origem do mesmo dia
- **Validation**: Derivadas deterministicamente em `enriquecer_dia`

### Agregação D-1
- **Fields**: Product ID, Category, unidades (sum Units Sold), receita (sum _revenue)
- **Grão**: Produto × Categoria (soma lojas)
- **Ordenação**: unidades descendente

### Variáveis de execução D-1
- **DATA_EXECUCAO**: Timestamp — quando a esteira roda ("hoje")
- **DIA_DADO**: DATA_EXECUCAO - 1 dia — partição enriquecida consumida
