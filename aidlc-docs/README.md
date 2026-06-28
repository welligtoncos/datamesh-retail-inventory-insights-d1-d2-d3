# AI-DLC · Gestão do backlog deste projeto

Documentação da esteira **local → AWS** para `Esteira_3Relatorios_D1_D2_D3.ipynb`.

## Onde está cada coisa

| Arquivo | Para quê |
|---------|----------|
| [`aidlc-state.md`](aidlc-state.md) | Status atual da fase AI-DLC e da entrega |
| [`inception/user-stories/personas.md`](inception/user-stories/personas.md) | Quem usa a esteira |
| [`inception/user-stories/stories.md`](inception/user-stories/stories.md) | Todas as user stories (INVEST + critérios) |
| [`inception/user-stories/backlog-roadmap.md`](inception/user-stories/backlog-roadmap.md) | **Caminho completo**: ordem, dependências, ondas |
| [`audit.md`](audit.md) | Aprovações e decisões com data |

## Como gerenciar as stories (regra simples)

1. **Uma fonte da verdade** → só edite `stories.md` e `backlog-roadmap.md` (não espalhe stories no chat).
2. **Trabalhe por onda (W1…W6)** → cada onda = 1 épico ou grupo pequeno; não pule dependência.
3. **Status por story** → no `stories.md`, use: `backlog` | `ready` | `in_progress` | `done` | `blocked`.
4. **Aprovação AI-DLC** → antes de Construction de cada onda, marque no `audit.md` e atualize `aidlc-state.md`.
5. **Espelho notebook** → toda story AWS deve citar a função/célula local equivalente.

## Caminho resumido (6 ondas)

```
W1 Fundação S3/IAM          → E1 (4 stories)
W2 Origem diária            → E2 (3 stories)     depende W1
W3 Enriquecimento           → E3 (3 stories)     depende W2
W4 Orquestração             → E4 (3 stories)     depende W3
W5 Relatório D-1            → E5 (3 stories)     depende W4
W6 D-2, D-3 + Operação      → E6 + E7 (5 stories) depende W5
```

Detalhe completo: [`backlog-roadmap.md`](inception/user-stories/backlog-roadmap.md).

## Próximo passo AI-DLC

1. Completar **Requirements Analysis** (quando iniciar fase formal).
2. Revisar e **aprovar** `stories.md` + `personas.md`.
3. **Workflow Planning** → marcar só **W1** como escopo da primeira Construction.
4. Implementar U1 (infra S3) → validar → W2, e assim por diante.

## Convenções de ID

- **Épico:** `E1` … `E7`
- **Story:** `E1-US01`, `E2-US02`, …
- **Onda:** `W1` … `W6`
- **Unidade de deploy (futuro):** `U1` … `U6` (mapeada no roadmap)

## Processo completo do desenvolvedor

Passo a passo detalhado (primeira story, decisões, prompt Cursor, checklist): **[`../aidlc-rules/README.md`](../aidlc-rules/README.md#processo-de-desenvolvimento-como-usar-o-ai-dlc-neste-projeto)**.
