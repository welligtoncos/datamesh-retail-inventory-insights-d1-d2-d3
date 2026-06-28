# Athena · Queries de validação do datamesh

Guia operacional para validar a esteira **retail inventory insights** via SQL no Amazon Athena.

| Item | Valor |
|------|-------|
| **Database** | `retail_inventory_insights_dev` |
| **Workgroup** | `retail-inventory-insights-dev` |
| **Região** | `us-east-1` |
| **Tabela catalogada** | `enriquecido` |
| **Dados S3** | `s3://retail-inventory-insights-dev-use1/enriquecido/dt=YYYY-MM-DD/data.parquet` |
| **Resultados Athena** | `s3://retail-inventory-insights-dev-use1/athena-results/` |
| **Arquivo SQL** | [`athena-validation-queries.sql`](athena-validation-queries.sql) |
| **Query exemplo W6** | [`athena-example-query.sql`](athena-example-query.sql) |

---

## Escopo do Athena neste projeto

O catálogo Glue expõe **apenas a camada enriquecida**. As queries abaixo validam:

- W3/W4 — enriquecimento e partições diárias
- W5 — lógica equivalente ao relatório **D-1** (produtos vendidos)
- W6 — lógica equivalente aos relatórios **D-2** (rupturas) e **D-3** (tendência)
- E7-US01 — consulta ad hoc sobre `enriquecido/dt=`

**Não consultável hoje via Athena:**

| Camada | Onde validar |
|--------|--------------|
| `origem/dt=` | S3 ou `scripts/compare_origem_parquet.py` |
| Excel D-1/D-2/D-3 | S3 `relatorios/` ou invoke Lambda |
| Alarme SFN | `scripts/ensure-sfn-alarm.ps1` / CloudWatch |

> Os arquivos `.xlsx` em `relatorios/D1|D2|D3/` não estão no Glue. Para validar o **resultado exato** do Excel, baixe do S3 ou invoque a Lambda. No Athena, replique a lógica do relatório em SQL sobre `enriquecido`.

---

## Como executar

### Console AWS

1. Abra **Amazon Athena** → região **us-east-1**
2. Selecione workgroup `retail-inventory-insights-dev`
3. Selecione database `retail_inventory_insights_dev`
4. Cole **uma query por vez** (Athena executa um statement por vez)
5. Confira status **SUCCEEDED** e resultados na grade (ou Download CSV)

### CLI (PowerShell)

```powershell
# Exemplo: contagem de linhas dt=2022-01-01
$qExec = aws athena start-query-execution `
  --query-string "SELECT COUNT(*) AS n FROM retail_inventory_insights_dev.enriquecido WHERE dt = '2022-01-01'" `
  --query-execution-context Database=retail_inventory_insights_dev `
  --work-group retail-inventory-insights-dev `
  --region us-east-1 `
  --output json | ConvertFrom-Json

$qid = $qExec.QueryExecutionId

do {
  Start-Sleep -Seconds 3
  $q = aws athena get-query-execution --query-execution-id $qid --region us-east-1 --output json | ConvertFrom-Json
  $state = $q.QueryExecution.Status.State
} while ($state -in @("RUNNING", "QUEUED"))

aws athena get-query-results --query-execution-id $qid --region us-east-1
```

Executar query de um arquivo:

```powershell
aws athena start-query-execution `
  --query-string file://c:/welligton-aws/project-datamesh-1/scripts/athena-example-query.sql `
  --query-execution-context Database=retail_inventory_insights_dev `
  --work-group retail-inventory-insights-dev `
  --region us-east-1
```

Validação automatizada (inclui Athena):

```powershell
.\scripts\w6-run-and-validate.ps1
```

---

## Convenções SQL

| Regra | Exemplo |
|-------|---------|
| Colunas com espaço | `"Store ID"`, `"Product ID"` |
| Colunas enriquecidas | `"_revenue"`, `"_stockout"`, `"_lost"`, `"_is_weekend"` |
| Partição obrigatória | `WHERE dt = '2022-01-01'` |
| Formato da partição | `yyyy-MM-dd` |

A tabela usa **partition projection** (`2022-01-01` a `2024-12-31`). Athena aceita consultar qualquer `dt` nesse intervalo, mas só retorna dados se o Parquet existir no S3.

---

## Referência de colunas (`enriquecido`)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Date` | timestamp | Data/hora do registro |
| `Store ID` | string | Loja |
| `Product ID` | string | Produto |
| `Category` | string | Categoria |
| `Region` | string | Região |
| `Inventory Level` | int | Estoque |
| `Units Sold` | int | Unidades vendidas |
| `Units Ordered` | int | Unidades pedidas |
| `Demand Forecast` | double | Previsão de demanda |
| `Price` | double | Preço |
| `Discount` | int | Desconto (%) |
| `_revenue` | double | Receita calculada |
| `_stockout` | int | Flag ruptura (0/1) |
| `_lost` | double | Venda perdida |
| `_is_weekend` | int | Fim de semana (0/1) |
| `dt` | string (partição) | Dia do dado (`YYYY-MM-DD`) |

---

## Queries por objetivo de validação

### 1. Smoke test — catálogo e conectividade

**Objetivo:** confirmar que o database, a tabela e o S3 respondem.

```sql
SHOW TABLES IN retail_inventory_insights_dev;
```

```sql
SELECT *
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
LIMIT 5;
```

| Critério OK | Resultado esperado |
|-------------|-------------------|
| Tabela existe | `enriquecido` listada |
| Query SUCCEEDED | 5 linhas com colunas `_revenue`, `_stockout`, `_lost`, `_is_weekend` |

---

### 2. W3/W4 — sanidade da partição diária

**Objetivo:** validar que `processar_dia(dt)` gravou o volume e totais corretos.

```sql
SELECT
  dt,
  COUNT(*) AS linhas,
  COUNT(DISTINCT "Store ID") AS lojas,
  COUNT(DISTINCT "Product ID") AS produtos,
  ROUND(SUM("_revenue"), 2) AS receita_total,
  SUM("_stockout") AS qtd_stockout,
  ROUND(AVG("_stockout") * 100, 1) AS pct_stockout
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
GROUP BY dt;
```

**Valores de referência (`dt = '2022-01-01'`, paridade W3):**

| Métrica | Esperado |
|---------|----------|
| `linhas` | **100** (5 lojas × 20 produtos) |
| `lojas` | 5 |
| `produtos` | 20 |
| `receita_total` | **879026.03** |
| `pct_stockout` | **0.0%** |

Múltiplas partições:

```sql
SELECT dt, COUNT(*) AS linhas, ROUND(SUM("_revenue"), 2) AS receita
FROM retail_inventory_insights_dev.enriquecido
WHERE dt IN ('2022-01-01', '2022-01-02', '2022-01-03')
GROUP BY dt
ORDER BY dt;
```

---

### 3. W3 — colunas enriquecidas

**Objetivo:** garantir que o job `enriquecer_dia` populou métricas sem nulos.

```sql
SELECT
  dt,
  COUNT(*) AS n,
  SUM(CASE WHEN "_revenue" IS NULL THEN 1 ELSE 0 END) AS revenue_nulos,
  SUM(CASE WHEN "_stockout" IS NULL THEN 1 ELSE 0 END) AS stockout_nulos,
  SUM(CASE WHEN "_lost" IS NULL THEN 1 ELSE 0 END) AS lost_nulos,
  SUM(CASE WHEN "_is_weekend" IS NULL THEN 1 ELSE 0 END) AS weekend_nulos
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
GROUP BY dt;
```

| Critério OK | Esperado |
|-------------|----------|
| Colunas enriquecidas | Todos os `_nulos = 0` |

Receita vs fórmula:

```sql
SELECT
  "_revenue",
  ROUND("Units Sold" * "Price" * (1 - "Discount" / 100.0), 2) AS revenue_calculada
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
LIMIT 10;
```

---

### 4. W5 — equivalente ao relatório D-1

**Objetivo:** replicar a agregação da Lambda `gerar_relatorio_d1` (produto × categoria, ordenado por unidades).

Top 10 produtos:

```sql
SELECT
  "Product ID",
  "Category",
  SUM("Units Sold") AS unidades,
  ROUND(SUM("_revenue"), 2) AS receita
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
GROUP BY 1, 2
ORDER BY unidades DESC
LIMIT 10;
```

Totais (paridade E5-US03):

```sql
SELECT
  COUNT(DISTINCT "Product ID") AS produtos_distintos,
  SUM("Units Sold") AS total_unidades,
  ROUND(SUM("_revenue"), 2) AS total_receita
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01';
```

| Métrica | Esperado |
|---------|----------|
| `produtos_distintos` | **69** |
| `total_unidades` | **14484** |
| `total_receita` | **879026.03** |
| Top 3 produtos | **P0014**, **P0015**, **P0002** |

---

### 5. W6 — equivalente ao relatório D-2 (rupturas)

**Objetivo:** mesma regra da Lambda D-2 — `"_stockout" = 1` **e** `"_lost" > 0`, ordenado por venda perdida.

```sql
SELECT
  "Store ID",
  "Product ID",
  "Category",
  "_lost" AS venda_perdida
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
  AND "_stockout" = 1
  AND "_lost" > 0
ORDER BY "_lost" DESC;
```

Query oficial E7-US01 (top rupturas):

```sql
SELECT "Store ID", "Product ID", SUM("_lost") AS lost_total
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01' AND "_stockout" = 1
GROUP BY 1, 2
ORDER BY lost_total DESC
LIMIT 10;
```

| Nota | Detalhe |
|------|---------|
| `dt = '2022-01-01'` | Pode retornar **0 rupturas** — válido (`pct_stockout = 0%`) |
| Encontrar dias com ruptura | Use a query “rupturas por dia” no arquivo SQL |

---

### 6. W6 — visão tipo D-3 (tendência / FDS)

**Objetivo:** aproximar a lógica D-3 — média em dias úteis vs fim de semana por loja×produto.

```sql
SELECT
  "Store ID",
  "Product ID",
  AVG(CASE WHEN "_is_weekend" = 0 THEN "Units Sold" END) AS media_uteis,
  AVG(CASE WHEN "_is_weekend" = 1 THEN "Units Sold" END) AS media_fds,
  COUNT(DISTINCT dt) AS dias_na_janela
FROM retail_inventory_insights_dev.enriquecido
WHERE dt IN ('2022-01-01', '2022-01-02', '2022-01-03')
GROUP BY 1, 2
ORDER BY media_uteis DESC
LIMIT 20;
```

A classificação **Subindo/Caindo/Estável** (±5%) está na Lambda D-3; no Athena use agregações adicionais se precisar replicá-la.

---

### 7. Qualidade e consistência

| Query | O que valida | OK se |
|-------|--------------|-------|
| `COUNT(*)` por `dt` | Partição existe no S3 | `linhas > 0` |
| Duplicatas loja×produto×dia | Grão correto | 0 linhas no `HAVING COUNT(*) > 1` |
| Cobertura dimensional | Regiões/categorias | Valores estáveis entre dias |

---

## Checklist rápido

| # | Validação | Query (seção) | Critério |
|---|-----------|---------------|----------|
| 1 | Catálogo | §1 | `enriquecido` existe |
| 2 | Volume diário | §2 | 100 linhas em `2022-01-01` |
| 3 | Receita | §2 | 879026.03 |
| 4 | Enriquecimento | §3 | Sem nulos em `_*` |
| 5 | D-1 totais | §4 | 69 produtos, 14484 un. |
| 6 | D-1 top3 | §4 | P0014, P0015, P0002 |
| 7 | D-2 rupturas | §5 | SUCCEEDED (0+ linhas) |
| 8 | Multi-dt | §2.1 | 2022-01-01..03 com dados |
| 9 | Duplicatas | §7 | Nenhuma |
| 10 | DoD W6 | script | `w6-run-and-validate.ps1` → CHECKS PASSED |

---

## Mapeamento onda → query

```text
W1 (S3)          → §7.1 (partição acessível)
W2 (origem)      → N/A no Athena (sem tabela origem)
W3 (enriquecido) → §2, §3
W4 (SFN)         → §2.1 (múltiplos dt)
W5 (D-1 Excel)   → §4
W6 (D-2/D-3)     → §5, §6
W6 (E7-US01)     → §5.1 / athena-example-query.sql
W6 (E7-US02)     → CloudWatch (fora do Athena)
```

---

## Problemas comuns

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| 0 linhas para um `dt` | Partição não processada | Rodar SFN: `.\scripts\w4-run-and-validate.ps1 -Dts @("YYYY-MM-DD")` |
| `COLUMN_NOT_FOUND` | Aspas faltando | Use `"Store ID"`, não `Store ID` |
| `HIVE_BAD_DATA` | Schema divergente | Reprocessar partição via Glue |
| Query lenta | Scan amplo | Sempre filtrar `dt`; evite `SELECT *` em janelas grandes |
| Resultado ≠ Excel D-1 | Agregação diferente | Compare com §4 (GROUP BY produto+categoria) |

---

## Referências

- Terraform Athena: `terraform/modules/athena/`
- Design W6: `aidlc-docs/construction/u6-relatorios-ops/application-design.md`
- Paridade local vs AWS: `scripts/compare_enriquecido_parquet.py`
- Story E7-US01: `aidlc-docs/inception/user-stories/stories.md`
