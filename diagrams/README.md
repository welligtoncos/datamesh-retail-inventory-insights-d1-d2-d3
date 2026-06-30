# Diagramas · Esteira_3Relatorios_D1_D2_D3

Diagramas [Mermaid](https://mermaid.js.org/) alinhados ao fluxo do notebook
`Esteira_3Relatorios_D1_D2_D3.ipynb` e à operação AWS / uso empresarial.

Visualizar: preview no Cursor/VS Code ou https://mermaid.live

## Índice

| Arquivo | Conteúdo |
|---------|----------|
| [01-fluxo-notebook.mmd](01-fluxo-notebook.mmd) | Fluxo §0 Setup → §1 Insumo → §2 Incremental → §3 Relatórios |
| [02-estrutura-pastas.mmd](02-estrutura-pastas.mmd) | CSV, `tabela_origem/`, `tabela_enriquecida/`, Excel D-1 |
| [03-processamento-incremental.mmd](03-processamento-incremental.mmd) | `carregar_origem_dia` → `enriquecer_dia` → acumulado |
| [04-insights-d1-d2-d3.mmd](04-insights-d1-d2-d3.mmd) | Três insights, campos e decisões |
| [05-relatorio-d1.mmd](05-relatorio-d1.mmd) | Geração do Excel D-1 com defasagem D-1 |
| [06-analista.mmd](06-analista.mmd) | Como o analista trata cada insight |
| [07-equivalencia-aws.mmd](07-equivalencia-aws.mmd) | Mesmo pipeline na AWS (S3, Glue, Step Functions) |
| [08-datamesh-empresa.mmd](08-datamesh-empresa.mmd) | Visão empresa: AWS, insights D-1/D-2/D-3, adoção |
| [09-portal-web.mmd](09-portal-web.mmd) | Portal web: gestão de insumos, enriquecidos, insights e encaixe AWS |

**Guia de uso empresarial:** [docs/como-usar-datamesh-empresa.md](../docs/como-usar-datamesh-empresa.md)

Documentação completa: [PROJETO_DATAMESH.txt](../PROJETO_DATAMESH.txt)
