# AI-DLC State

## Projeto
- **Nome:** datamesh-retail-inventory-insights-d1-d2-d3
- **Escopo:** Migrar esteira do notebook `Esteira_3Relatorios_D1_D2_D3.ipynb` para AWS
- **Referência local:** `PROJETO_DATAMESH.txt`, `diagrams/07-equivalencia-aws.mmd`

## Fase AI-DLC atual
| Fase | Status | Notas |
|------|--------|-------|
| Workspace Detection | pending | |
| Reverse Engineering | pending | Notebook como fonte brownfield |
| Requirements Analysis | pending | |
| User Stories | **draft** | `inception/user-stories/stories.md` criado |
| Workflow Planning | pending | |
| Application Design | pending | |
| Units Generation | pending | |
| Construction | pending | Começar por W1 / U1 apenas |

## Entrega por onda
| Onda | Épico | Stories | Status entrega |
|------|-------|---------|----------------|
| W1 | E1 Fundação | 4 | backlog |
| W2 | E2 Origem | 3 | backlog |
| W3 | E3 Enriquecimento | 3 | backlog |
| W4 | E4 Orquestração | 3 | backlog |
| W5 | E5 Relatório D-1 | 3 | backlog |
| W6 | E6 + E7 D-2/D-3/Ops | 5 | backlog |

## Decisões pendentes (preencher no Requirements)
- [ ] Região AWS (ex.: sa-east-1)
- [ ] IaC: CDK / Terraform / Console
- [ ] Um bucket vs. vários buckets
- [ ] Entrega do Excel: S3 apenas / e-mail / ambos
- [ ] Horário do cron diário (EventBridge)

## Última atualização
- 2026-06-24 — Backlog inicial e roadmap criados
