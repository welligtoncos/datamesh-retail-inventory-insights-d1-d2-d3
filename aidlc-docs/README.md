# AI-DLC · Gestão do backlog deste projeto

Documentação da esteira **local → AWS** para `Esteira_3Relatorios_D1_D2_D3.ipynb`.

## Onde está cada coisa

| Arquivo | Para quê |
|---------|----------|
| [`aidlc-state.md`](aidlc-state.md) | Status atual da fase AI-DLC e da entrega |
| [`inception/requirements/requirements.md`](inception/requirements/requirements.md) | Requisitos da onda atual |
| [`inception/plans/execution-plan.md`](inception/plans/execution-plan.md) | Plano de execução Inception + Construction |
| [`inception/reverse-engineering/`](inception/reverse-engineering/) | Análise brownfield do notebook |
| [`inception/application-design/`](inception/application-design/) | Design da unidade (ex.: U1 S3/IAM) |
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

---

## Revisar Inception antes de Construction

Quando o agente mostrar **REVIEW REQUIRED** (Reverse Engineering, Requirements, Stories, Execution Plan, Application Design), **não aprove no automático**. Revise se o Inception descreve exatamente o que será construído na onda atual.

### O que você está aprovando

Ao **Approve & Continue**, você autoriza **Construction** da unidade da onda (ex.: U1 = Terraform S3 + IAM + docs, **sem** Glue/Lambda/Step Functions). Erro no Inception vira código errado.

### Ordem de revisão (15–20 min)

```
1. inception/requirements/requirements.md
2. inception/user-stories/stories.md (só épico da onda, ex. E1)
3. inception/plans/execution-plan.md
4. inception/reverse-engineering/ (architecture.md + component-inventory.md)
5. inception/application-design/ (application-design.md)
6. aidlc-state.md + audit.md
```

### 1 · Requirements

| Verificar | Deve constar |
|-----------|--------------|
| Escopo | Apenas onda atual; compute futuro **fora de escopo** |
| Região / bucket / IaC | Igual às decisões em `aidlc-state.md` |
| Prefixos S3 | `insumo/`, `origem/dt=`, `enriquecido/dt=`, `relatorios/D1\|D2\|D3/` |
| IAM | Roles preparatórias com least privilege |
| Paridade | Tabela local → S3 com `dt=` e exemplo de relatório |

**Red flag:** Glue, Lambda ou cron na rodada W1.

### 2 · Stories (onda atual)

Para W1, revise **E1-US01 a E1-US04**. Cada critério de aceite deve ser **testável** após o deploy:

| Story | Validar depois com |
|-------|-------------------|
| E1-US01 | `aws s3 ls` + prefixos documentados |
| E1-US02 | CSV em `insumo/` + 15 colunas SCHEMA |
| E1-US03 | 3 roles; policies só nos prefixos |
| E1-US04 | Mapa local→S3 com paths completos |

**Red flag:** stories de ondas futuras como `done` ou `in_progress`.

### 3 · Execution plan

- [ ] Construction listada só para a unidade da onda (ex. Terraform U1)
- [ ] **SKIP** explícito: Glue, Lambda, Step Functions (em W1)
- [ ] Notebook **não** alterado nesta rodada

### 4 · Reverse engineering

Compare com `Esteira_3Relatorios_D1_D2_D3.ipynb`:

- `carregar_origem_dia`, `enriquecer_dia`, `processar_dia` documentadas
- Colunas `_*` e defasagem D-1 no relatório
- Sem multi-domínio mesh ou notebooks inexistentes

### 5 · Application design

- Componentes = S3 + IAM + Terraform + documentação (W1)
- Upload CSV **manual** (fora do state Terraform)
- Estrutura prevista: `terraform/modules/s3`, `terraform/modules/iam`, `terraform/environments/dev`

### Matriz de decisão

| Situação | Ação |
|----------|------|
| Tudo ok; só ajuste de texto | **Approve & Continue** |
| Região, bucket ou IaC errados | **Request Changes** em `requirements.md` + `aidlc-state.md` |
| Escopo vazou (Glue/Lambda) | **Request Changes** em `execution-plan.md` |
| RE não bate com notebook | **Request Changes** em `reverse-engineering/` |

### Como pedir mudanças

```text
Request Changes — Inception W1:
1. requirements.md: [o que mudar]
2. execution-plan.md: [o que mudar]
Não iniciar Construction até atualizar aidlc-state.md.
```

### Como aprovar

```text
Approve & Continue — Inception W1 aprovado.
Decisões: sa-east-1, Terraform, bucket retail-inventory-insights-dev, env dev.
Escopo Construction U1: S3 + IAM + docs; sem Glue/Lambda/SFN.
Registrar aprovação em aidlc-docs/audit.md.
```

### Depois da aprovação

O agente gera Terraform e documentação. **W1 só fica `done`** quando os checkboxes das stories E1-US01…04 estiverem validados (não basta gerar código).

### Checklist copiável

```
[ ] requirements.md — só onda atual, sem compute
[ ] stories E1 — critérios testáveis, status ready
[ ] execution-plan — Construction = Terraform; SKIP Glue/Lambda/SFN
[ ] reverse-engineering — funções do notebook corretas
[ ] application-design — S3 + 3 roles + upload manual CSV
[ ] aidlc-state.md — decisões [x] corretas
[ ] Nenhuma onda futura nesta rodada
```
