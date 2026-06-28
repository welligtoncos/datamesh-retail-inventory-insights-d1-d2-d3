# Como usar o datamesh na empresa · Guia de insights

Este guia explica **como o datamesh de estoque varejo funciona** e **como equipes de negócio e tecnologia** o utilizam para gerar insights acionáveis (D-1, D-2, D-3).

| Item | Referência |
|------|------------|
| Diagramas Mermaid | [`diagrams/08-datamesh-empresa.mmd`](../diagrams/08-datamesh-empresa.mmd) |
| Queries Athena | [`scripts/athena-validation-queries.md`](../scripts/athena-validation-queries.md) |
| Documentação técnica | [`PROJETO_DATAMESH.txt`](../PROJETO_DATAMESH.txt) |
| Personas | [`aidlc-docs/inception/user-stories/personas.md`](../aidlc-docs/inception/user-stories/personas.md) |

---

## O que é este datamesh

Este projeto implementa uma **esteira de dados de produto** para varejo, com camadas padronizadas e três relatórios de insight:

| Camada S3 | Conteúdo |
|-----------|----------|
| `insumo/` | Dados brutos (CSV, futuro: ERP/POS) |
| `origem/dt=` | Snapshot diário filtrado |
| `enriquecido/dt=` | Métricas de negócio (`_revenue`, `_stockout`, `_lost`, `_is_weekend`) |
| `relatorios/D1\|D2\|D3/` | Excel para gestores |

**Defasagem D-1:** a esteira executa hoje (`DATA_EXECUCAO`) e processa o dado de **ontem** (`DIA_DADO` / `dt`).

---

## 1. Visão geral — da fonte ao insight

```mermaid
flowchart TB
    subgraph FONTES["Fontes de dados (empresa)"]
        ERP["ERP / WMS / POS"]
        CSV["CSV / API / Stream"]
    end

    subgraph INGESTAO["Camada bruta"]
        INS["S3 insumo/"]
    end

    subgraph TRANSFORM["Camada transformada (particionada por dt)"]
        ORIG["S3 origem/dt="]
        ENR["S3 enriquecido/dt=<br/>+ _revenue, _stockout, _lost, _is_weekend"]
    end

    subgraph PRODUTOS["Produtos de insight"]
        D1["D-1 Produtos vendidos<br/>Excel relatorios/D1/"]
        D2["D-2 Reposição / rupturas<br/>Excel relatorios/D2/"]
        D3["D-3 Tendência consumo<br/>Excel relatorios/D3/"]
    end

    subgraph CONSUMO["Como a empresa consome"]
        P1["Analista de estoque"]
        P3["Gestor compras / loja"]
        ATH["Athena SQL<br/>consultas ad hoc"]
        CW["CloudWatch alarme<br/>se a esteira falhar"]
    end

    ERP --> CSV
    CSV --> INS
    INS --> ORIG
    ORIG --> ENR
    ENR --> D1 & D2 & D3
    ENR --> ATH
    D1 & D2 & D3 --> P1 & P3
    ATH --> P1
    ENR -.-> CW
```

---

## 2. Arquitetura AWS

```mermaid
flowchart TB
    subgraph AGENDA["Agendamento"]
        EB["EventBridge<br/>cron diário"]
        SFN["Step Functions<br/>processar_dia(dt)"]
    end

    subgraph JOBS["Processamento"]
        G1["Glue Job<br/>carregar_origem_dia"]
        G2["Glue Job<br/>enriquecer_dia"]
    end

    subgraph STORAGE["S3 Data Lake"]
        S1["insumo/"]
        S2["origem/dt=/data.parquet"]
        S3["enriquecido/dt=/data.parquet"]
        S4["relatorios/D1|D2|D3/*.xlsx"]
        S5["athena-results/"]
    end

    subgraph REPORTS["Relatórios (Lambda)"]
        L1["gerar_relatorio_d1"]
        L2["gerar_relatorio_d2"]
        L3["gerar_relatorio_d3"]
    end

    subgraph CATALOG["Consulta analítica"]
        GLUE["Glue Catalog"]
        ATH["Athena Workgroup"]
        TBL["Tabela enriquecido"]
    end

    subgraph OPS["Operação"]
        ALM["Alarme SFN failed"]
    end

    EB --> SFN
    SFN --> G1 --> S2
    G1 --> G2 --> S3
    S1 --> G1

    S3 --> L1 & L2 & L3
    L1 --> S4
    L2 --> S4
    L3 --> S4

    S3 --> GLUE --> TBL
    TBL --> ATH --> S5

    SFN -.-> ALM
```

### Fluxo diário

1. **EventBridge** dispara no horário configurado.
2. **Step Functions** executa `processar_dia(dt)` com `dt = ontem`.
3. **Glue** grava `origem/dt=` e `enriquecido/dt=`.
4. **Lambdas** geram Excel D-1, D-2 e D-3.
5. **Analistas** baixam Excel ou consultam **Athena**.
6. Falha na SFN → **CloudWatch alarme**.

---

## 3. Ciclo temporal — execução vs dado

```mermaid
sequenceDiagram
    participant EB as EventBridge
    participant SFN as Step Functions
    participant GLUE as Glue Jobs
    participant S3 as S3 enriquecido
    participant L as Lambda Relatórios
    participant USR as Usuário negócio

    Note over EB,USR: Exemplo: execução 2022-01-04 processa dado 2022-01-03

    EB->>SFN: start processar_dia(dt=2022-01-03)
    SFN->>GLUE: origem + enriquecido
    GLUE->>S3: enriquecido/dt=2022-01-03/

    SFN->>L: gerar D-1 D-2 D-3
    L->>S3: relatorios/D1|D2|D3/*.xlsx
    USR->>S3: download Excel
    USR->>S3: Athena SQL sobre enriquecido
```

| Conceito | Significado | Exemplo |
|----------|-------------|---------|
| `DATA_EXECUCAO` | Quando a esteira rodou | 2022-01-04 |
| `DIA_DADO` / `dt` | Dia dos dados analisados | 2022-01-03 |
| Defasagem D-1 | Processa sempre o dia anterior | Vendas/estoque fechados de ontem |
| Janela D-3 | Últimos N dias até `dia_dado` | Tendência com 3, 7 ou 14 dias |

---

## 4. Três insights — pergunta, métrica, decisão

```mermaid
flowchart LR
    ENR["enriquecido/dt=<br/>dados enriquecidos"]

    subgraph D1["D-1 · Comercial"]
        Q1["O que mais vendeu?<br/>Onde está a receita?"]
        M1["Units Sold + _revenue<br/>por produto × categoria"]
        A1["Mix · promoção · exposição"]
    end

    subgraph D2["D-2 · Operacional"]
        Q2["O que está em ruptura?<br/>Quanto perdi de venda?"]
        M2["_stockout=1 e _lost>0<br/>por loja × produto"]
        A2["Reposição urgente<br/>transferência entre lojas"]
    end

    subgraph D3["D-3 · Planejamento"]
        Q3["Consumo sobe ou cai?<br/>FDS vs dias úteis?"]
        M3["_is_weekend + Units Sold<br/>janela de N dias"]
        A3["Estoque mínimo · compra<br/>sazonal · forecast"]
    end

    ENR --> D1 & D2 & D3
    Q1 --> M1 --> A1
    Q2 --> M2 --> A2
    Q3 --> M3 --> A3
```

---

## 5. Personas e canais de consumo

```mermaid
flowchart TB
    subgraph P1["P1 · Analista de estoque"]
        U1["Baixa Excel D-1/D-2/D-3"]
        U2["Valida totais no Athena"]
        U3["Publica insight para gestores"]
    end

    subgraph P3["P3 · Gestor compras / loja"]
        U4["Prioriza reposição D-2"]
        U5["Ajusta pedido D-3"]
        U6["Revisa ranking D-1"]
    end

    subgraph P2["P2 · Engenheiro de dados"]
        U7["Monitora SFN + alarmes"]
        U8["Reprocessa dt se necessário"]
        U9["Mantém paridade notebook ↔ AWS"]
    end

    subgraph CANAIS["Canais"]
        EX["Excel no S3"]
        SQL["Athena SQL"]
        ALM["CloudWatch alarme"]
    end

    EX --> P1 & P3
    SQL --> P1
    ALM --> P2
    P1 --> P3
```

| Persona | Relatório principal | Canal |
|---------|---------------------|-------|
| Analista de estoque | D-1, validação cruzada | Excel + Athena |
| Gestor compras / loja | D-2, D-3 | Excel |
| Engenheiro de dados | Operacional | SFN, CloudWatch, scripts |

---

## 6. Rotina diária na empresa

| Horário | Quem | Ação |
|---------|------|------|
| 06:00 | Plataforma | EventBridge dispara `processar_dia(ontem)` |
| 06:15 | Eng. dados | Confirma SFN **SUCCEEDED** (ou trata alarme) |
| 08:00 | Analista | Baixa Excel D-1, D-2, D-3 do S3 |
| 08:30 | Gestor compras | Lê D-2 — rupturas por `_lost` |
| 09:00 | Comercial | Lê D-1 — ranking e receita |

### D-1 · Produtos vendidos (decisão comercial)

**Pergunta:** *O que saiu ontem? Onde está o dinheiro?*

| Campo | Uso |
|-------|-----|
| Ranking por unidades | Identificar best-sellers |
| Receita por produto | Focar margem vs volume |
| Insight no Excel | Concentração top 3 → risco de dependência |

**Exemplo:** P0014 e P0015 lideram há 5 dias → aumentar exposição e evitar ruptura nesses SKUs.

### D-2 · Reposição (decisão operacional)

**Pergunta:** *O que está em ruptura? Quanto estou perdendo?*

| Regra | Significado |
|-------|-------------|
| `_stockout = 1` | Ruptura de estoque |
| `_lost > 0` | Venda perdida estimada |
| Ordenação por `_lost` | Priorizar maior impacto financeiro |

**Exemplo:** Loja S003, produto P0007, `_lost = 42` → pedido expresso; transferir de outra loja se houver estoque.

### D-3 · Tendência (decisão de planejamento)

**Pergunta:** *O consumo sobe ou cai? Fim de semana vende mais?*

| Métrica | Uso |
|---------|-----|
| Média úteis vs FDS | Ajustar entrega antes do fim de semana |
| Tendência ±5% | Subindo → mais estoque; Caindo → reduzir pedido |
| Janela N dias | Mais dias = tendência mais estável |

**Exemplo:** Tendência **Subindo** + média FDS > úteis → reforçar estoque de quinta a sábado.

---

## 7. Dois modos de consumo

```mermaid
flowchart LR
    subgraph MODO1["Modo 1 · Excel (negócio)"]
        E1["Gestor abre .xlsx"]
        E2["Lê insight no topo"]
        E3["Decide ação"]
    end

    subgraph MODO2["Modo 2 · Athena (analítico)"]
        A1["Analista escreve SQL"]
        A2["Cruza loja × produto × dt"]
        A3["Valida hipótese do Excel"]
    end

    ENR["enriquecido/dt="] --> MODO1
    ENR --> MODO2
```

| Modo | Público | Quando usar |
|------|---------|-------------|
| Excel | Gestores, compradores | Rotina diária, decisão rápida |
| Athena | Analistas, BI | Validação, drill-down, cruzamentos |

---

## 8. Jornada de adoção

```mermaid
flowchart TD
    F1["1. Conectar fonte<br/>ERP/POS → S3 insumo/"]
    F2["2. Validar insumo<br/>volume, schema, nulos"]
    F3["3. Processar histórico<br/>SFN para vários dt="]
    F4["4. Validar enriquecido<br/>Athena + paridade"]
    F5["5. Ativar relatórios<br/>D-1 → D-2 → D-3"]
    F6["6. Rotina diária<br/>Excel + reunião compras"]
    F7["7. Medir impacto<br/>rupturas ↓ receita ↑"]

    F1 --> F2 --> F3 --> F4 --> F5 --> F6 --> F7
```

| Fase | Ondas | KPI |
|------|-------|-----|
| Fundação | W1–W2 | Partição `origem/dt=` todo dia |
| Inteligência | W3–W4 | SFN SUCCEEDED; alarme OK |
| Insights | W5–W6 | Gestores usam D-1/D-2/D-3 |
| Maturidade | Evolução | Dashboards, ERP real-time |

---

## 9. Reunião semanal sugerida

| Dia | Relatório | Participantes | Pauta |
|-----|-----------|---------------|-------|
| Segunda | D-1 | Comercial + estoque | Top vendas, mix por categoria |
| Terça | D-2 | Compras + lojas | Rupturas críticas, pedidos urgentes |
| Quarta | D-3 | Planejamento | Tendências, ajuste de mínimos |
| Diário | Alarme SFN | Eng. dados | Esteira rodou? Reprocessar se falhou |

---

## 10. Métricas de sucesso

| Métrica | Como medir | Fonte |
|---------|------------|-------|
| Rupturas ativas | `COUNT` onde `_stockout=1` | D-2 / Athena |
| Venda perdida | `SUM(_lost)` | D-2 |
| Concentração receita | Top 3 / total | D-1 |
| Tendência consumo | % Subindo vs Caindo | D-3 |
| SLA da esteira | SFN SUCCEEDED / dia | CloudWatch |

---

## 11. Como executar na AWS (referência)

```powershell
# Validar esteira + relatórios + Athena
.\scripts\w6-run-and-validate.ps1

# Baixar relatório D-2
aws s3 cp s3://retail-inventory-insights-dev-use1/relatorios/D2/ . --recursive --region us-east-1

# Reprocessar um dia
.\scripts\w4-run-and-validate.ps1 -Dts @("2022-01-03")
```

---

## Resumo

> A empresa **alimenta o insumo**, a esteira **processa ontem**, o enriquecido **calcula ruptura e receita**, e os três relatórios transformam isso em **decisões comerciais (D-1), operacionais (D-2) e de planejamento (D-3)** — com Excel para gestores e Athena para analistas.
