# Personas · Esteira estoque D-1/D-2/D-3

## P1 · Analista de estoque (primária)
- **Objetivo:** Receber relatórios confiáveis com defasagem D-1/D-2/D-3.
- **Dor:** Dados manuais, sem ranking de vendas nem visão de ruptura.
- **Sucesso:** Excel no S3 (ou download) com insight legível e `dt=` correto.
- **Stories principais:** E5, E6, E1-US04

## P2 · Engenheiro de dados (primária)
- **Objetivo:** Pipeline idempotente, particionado, alinhado ao notebook.
- **Dor:** Reprocessar dia sem quebrar outras partições; provar paridade com local.
- **Sucesso:** `origem/dt=` e `enriquecido/dt=` no S3; mesma lógica que `processar_dia()`.
- **Stories principais:** E1, E2, E3, E4, E7

## P3 · Gestor de compras / operações de loja
- **Objetivo:** Saber o que repor (D-2) e se consumo sobe ou cai (D-3).
- **Dor:** Ruptura descoberta tarde; pedido no “feeling”.
- **Sucesso:** Lista priorizada por `_lost`; tendência em janela de N dias.
- **Stories principais:** E6

## P4 · Plataforma / FinOps AWS
- **Objetivo:** IAM mínimo, custo previsível, falhas visíveis.
- **Dor:** Roles amplas demais; esteira falha sem alarme.
- **Sucesso:** Least privilege; alarme CloudWatch; tags de custo.
- **Stories principais:** E1-US03, E7-US02

## Mapa persona → épico

| Persona | E1 | E2 | E3 | E4 | E5 | E6 | E7 |
|---------|----|----|----|----|----|----|-----|
| P1 Analista | ○ | ○ | ○ | ○ | ● | ● | ○ |
| P2 Eng. dados | ● | ● | ● | ● | ● | ● | ● |
| P3 Gestor compras | ○ | ○ | ○ | ○ | ○ | ● | ○ |
| P4 Plataforma | ● | ○ | ○ | ● | ○ | ○ | ● |

● = impacto alto · ○ = impacto baixo ou indireto
