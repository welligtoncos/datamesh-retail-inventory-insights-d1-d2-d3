-- =============================================================================
-- Athena · queries de validação do datamesh (retail inventory insights)
-- Database : retail_inventory_insights_dev
-- Workgroup: retail-inventory-insights-dev
-- Região   : us-east-1
-- Documentação: scripts/athena-validation-queries.md
-- =============================================================================
-- Colunas com espaço ou underscore exigem aspas duplas: "Store ID", "_lost"
-- Partição obrigatória: dt = 'YYYY-MM-DD'
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Smoke test — catálogo e conectividade
-- -----------------------------------------------------------------------------

-- 1.1 Listar tabelas (rodar separado no console)
-- SHOW TABLES IN retail_inventory_insights_dev;

-- 1.2 Amostra de linhas
SELECT *
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
LIMIT 5;


-- -----------------------------------------------------------------------------
-- 2. W3/W4 — sanidade da partição diária (dt=2022-01-01)
-- Esperado: 100 linhas, receita 879026.03, pct_stockout 0.0
-- -----------------------------------------------------------------------------

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


-- 2.1 Múltiplas partições processadas pela SFN
SELECT
  dt,
  COUNT(*) AS linhas,
  ROUND(SUM("_revenue"), 2) AS receita
FROM retail_inventory_insights_dev.enriquecido
WHERE dt IN ('2022-01-01', '2022-01-02', '2022-01-03')
GROUP BY dt
ORDER BY dt;


-- -----------------------------------------------------------------------------
-- 3. W3 — colunas enriquecidas (_revenue, _stockout, _lost, _is_weekend)
-- -----------------------------------------------------------------------------

SELECT
  dt,
  COUNT(*) AS n,
  SUM(CASE WHEN "_revenue" IS NULL THEN 1 ELSE 0 END) AS revenue_nulos,
  SUM(CASE WHEN "_stockout" IS NULL THEN 1 ELSE 0 END) AS stockout_nulos,
  SUM(CASE WHEN "_lost" IS NULL THEN 1 ELSE 0 END) AS lost_nulos,
  SUM(CASE WHEN "_is_weekend" IS NULL THEN 1 ELSE 0 END) AS weekend_nulos,
  MIN("_is_weekend") AS min_weekend,
  MAX("_is_weekend") AS max_weekend
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
GROUP BY dt;


-- 3.1 Receita coerente com preço × vendas × desconto
SELECT
  "Store ID",
  "Product ID",
  "Units Sold",
  "Price",
  "Discount",
  "_revenue",
  ROUND("Units Sold" * "Price" * (1 - "Discount" / 100.0), 2) AS revenue_calculada
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
LIMIT 10;


-- -----------------------------------------------------------------------------
-- 4. W5 — equivalente ao relatório D-1 (produtos vendidos)
-- Esperado dt=2022-01-01: 69 produtos, 14484 unidades, receita 879026.03
-- Top3: P0014, P0015, P0002
-- -----------------------------------------------------------------------------

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


-- 4.1 Totais D-1
SELECT
  COUNT(DISTINCT "Product ID") AS produtos_distintos,
  SUM("Units Sold") AS total_unidades,
  ROUND(SUM("_revenue"), 2) AS total_receita
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01';


-- 4.2 Top 3 produtos (paridade E5-US03)
SELECT "Product ID", SUM("Units Sold") AS unidades
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
GROUP BY 1
ORDER BY unidades DESC
LIMIT 3;


-- -----------------------------------------------------------------------------
-- 5. W6 — equivalente ao relatório D-2 (rupturas)
-- Regra: "_stockout" = 1 AND "_lost" > 0, ordenado por venda perdida
-- Nota: dt=2022-01-01 pode retornar 0 linhas (sem rupturas no dia)
-- -----------------------------------------------------------------------------

SELECT
  "Store ID",
  "Product ID",
  "Category",
  "Inventory Level",
  "Units Sold",
  "Demand Forecast",
  "_lost" AS venda_perdida
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
  AND "_stockout" = 1
  AND "_lost" > 0
ORDER BY "_lost" DESC;


-- 5.1 Top rupturas agregadas (query exemplo E7-US01 — ver athena-example-query.sql)
SELECT "Store ID", "Product ID", SUM("_lost") AS lost_total
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01' AND "_stockout" = 1
GROUP BY 1, 2
ORDER BY lost_total DESC
LIMIT 10;


-- 5.2 Rupturas por dia (encontrar dt com dados D-2)
SELECT
  dt,
  SUM(CASE WHEN "_stockout" = 1 AND "_lost" > 0 THEN 1 ELSE 0 END) AS rupturas
FROM retail_inventory_insights_dev.enriquecido
WHERE dt BETWEEN '2022-01-01' AND '2022-01-07'
GROUP BY dt
ORDER BY dt;


-- -----------------------------------------------------------------------------
-- 6. W6 — visão tipo D-3 (tendência / úteis vs FDS)
-- Janela de 3 dias até 2022-01-03
-- -----------------------------------------------------------------------------

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


-- 6.1 Consumo agregado por dia na janela
SELECT
  dt,
  day_of_week(CAST("Date" AS timestamp)) AS dia_semana,
  MAX("_is_weekend") AS is_weekend,
  SUM("Units Sold") AS unidades_dia
FROM retail_inventory_insights_dev.enriquecido
WHERE dt IN ('2022-01-01', '2022-01-02', '2022-01-03')
GROUP BY 1, 2
ORDER BY dt;


-- -----------------------------------------------------------------------------
-- 7. Qualidade e consistência do datamesh
-- -----------------------------------------------------------------------------

-- 7.1 Partição existe no S3? (0 linhas = partição ausente)
SELECT COUNT(*) AS linhas
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-03';


-- 7.2 Duplicatas no grão loja × produto × dia (esperado: 0 linhas)
SELECT
  dt,
  "Store ID",
  "Product ID",
  COUNT(*) AS ocorrencias
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01'
GROUP BY 1, 2, 3
HAVING COUNT(*) > 1;


-- 7.3 Cobertura dimensional
SELECT
  dt,
  COUNT(DISTINCT "Region") AS regioes,
  COUNT(DISTINCT "Category") AS categorias
FROM retail_inventory_insights_dev.enriquecido
WHERE dt IN ('2022-01-01', '2022-01-02', '2022-01-03')
GROUP BY dt
ORDER BY dt;
