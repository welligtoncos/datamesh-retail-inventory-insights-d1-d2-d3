SELECT "Store ID", "Product ID", SUM("_lost") AS lost_total
FROM retail_inventory_insights_dev.enriquecido
WHERE dt = '2022-01-01' AND "_stockout" = 1
GROUP BY 1, 2
ORDER BY lost_total DESC
LIMIT 10;
