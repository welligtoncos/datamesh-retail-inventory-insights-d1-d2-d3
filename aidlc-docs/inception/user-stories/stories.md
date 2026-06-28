    # User Stories · Esteira estoque AWS

**Projeto:** datamesh-retail-inventory-insights-d1-d2-d3  
**Fonte brownfield:** `Esteira_3Relatorios_D1_D2_D3.ipynb`  
**Roadmap:** [`backlog-roadmap.md`](backlog-roadmap.md)

**Status:** `backlog` | `ready` | `in_progress` | `done` | `blocked`

**W1 (E1-US01–04):** `done` — apply AWS 2026-06-28 · conta 303238378103

---

## Épico E1 · Fundação de dados (Onda W1)

### E1-US01 · Buckets e prefixos S3
- **Como** engenheiro de dados (P2)  
- **Quero** buckets S3 com prefixos `insumo/`, `origem/dt=`, `enriquecido/dt=`, `relatorios/D1|D2|D3/`  
- **Para** espelhar `tabela_origem/`, `tabela_enriquecida/` e saídas Excel do notebook  
- **Status:** done · **Onda:** W1 · **Depende:** —

**Critérios de aceite:**
- [x] Layout documentado (1 bucket: `retail-inventory-insights-dev`)
- [x] Particionamento `dt=YYYY-MM-DD/` igual ao local
- [x] Bloqueio de acesso público
- [x] Tags de ambiente/custo (ex.: `Project=retail-inventory-insights`)

---

### E1-US02 · Insumo no S3
- **Como** engenheiro de dados (P2)  
- **Quero** `retail_store_inventory.csv` em `insumo/`  
- **Para** a esteira AWS consumir o mesmo dataset do Kaggle  
- **Status:** done · **Onda:** W1 · **Depende:** E1-US01

**Critérios de aceite:**
- [x] Arquivo presente e legível pelas roles da esteira
- [x] 15 colunas do `SCHEMA` do notebook validadas
- [x] Volume de linhas documentado (sanidade §1 · 73.100 linhas)

---

### E1-US03 · IAM least privilege
- **Como** plataforma AWS (P4)  
- **Quero** roles para Glue, Lambda e Step Functions  
- **Para** ler/escrever apenas os prefixos da esteira  
- **Status:** done · **Onda:** W1 · **Depende:** E1-US01

**Critérios de aceite:**
- [x] Role Glue: leitura `insumo/`, leitura/escrita `origem/`, `enriquecido/`
- [x] Role Lambda relatórios: leitura `enriquecido/`, escrita `relatorios/`
- [x] Role Step Functions: invocar jobs/Lambdas da esteira
- [x] Nenhuma policy `*` em actions sensíveis

---

### E1-US04 · Mapa para o analista
- **Como** analista de estoque (P1)  
- **Quero** documentação de onde ficam insumo, camadas e relatórios  
- **Para** localizar arquivos sem Jupyter  
- **Status:** done · **Onda:** W1 · **Depende:** E1-US01

**Critérios de aceite:**
- [x] Tabela local → S3 em `aidlc-docs` ou README
- [x] Exemplo de path completo para um `dt` e um relatório D-1 futuro

---

## Épico E2 · Extração diária — origem (Onda W2)

### E2-US01 · carregar_origem_dia na AWS
- **Como** esteira automatizada (P2)  
- **Quero** extrair um dia do insumo para `origem/dt=/data.parquet`  
- **Para** replicar `carregar_origem_dia(dt)` do notebook  
- **Status:** done · **Onda:** W2 · **Depende:** E1-US02, E1-US03

**Critérios de aceite:**
- [x] Entrada: `dt` (YYYY-MM-DD)
- [x] Filtro `Date == dt` no insumo
- [x] Saída parquet em `origem/dt={dt}/data.parquet`
- [x] Idempotente: reexecução sobrescreve só essa partição

---

### E2-US02 · Reprocessamento por dia
- **Como** engenheiro de dados (P2)  
- **Quero** reprocessar um `dt` específico  
- **Para** corrigir falhas sem reprocessar o histórico inteiro  
- **Status:** done · **Onda:** W2 · **Depende:** E2-US01

**Critérios de aceite:**
- [x] Parâmetro `dt` isolado na execução
- [x] Partições `dt` diferentes permanecem intactas
- [x] Log com `dt`, row count, duração

---

### E2-US03 · Paridade com notebook (origem)
- **Como** engenheiro de dados (P2)  
- **Quero** comparar parquet AWS vs. `tabela_origem/dt=2022-01-01` local  
- **Para** garantir fidelidade brownfield  
- **Status:** done · **Onda:** W2 · **Depende:** E2-US01

**Critérios de aceite:**
- [x] Mesmo row count para `dt` de teste
- [x] Mesmas colunas e tipos
- [x] Evidência registrada (script ou nota em `aidlc-docs`)

---

## Épico E3 · Enriquecimento (Onda W3)

### E3-US01 · enriquecer_dia na AWS
- **Como** esteira (P2)  
- **Quero** ler `origem/dt=` e gravar `enriquecido/dt=` com métricas de negócio  
- **Para** replicar `enriquecer_dia(dt)`  
- **Status:** backlog · **Onda:** W3 · **Depende:** E2-US01

**Critérios de aceite:**
- [ ] `_revenue = Units Sold * Price`
- [ ] `_stockout` conforme notebook: vendeu estoque E forecast > estoque
- [ ] `_lost` quando `_stockout == 1`
- [ ] `_is_weekend` e coluna `dt`

---

### E3-US02 · Sanidade pós-enriquecimento
- **Como** analista (P1)  
- **Quero** indicadores de ruptura coerentes com §1 do notebook  
- **Para** confiar nos relatórios D-2 futuros  
- **Status:** backlog · **Onda:** W3 · **Depende:** E3-US01

**Critérios de aceite:**
- [ ] % linhas com `_stockout=1` documentado
- [ ] Desvio vs. notebook local dentro de tolerância acordada (ex.: 0% em mesmo insumo)

---

### E3-US03 · Paridade enriquecido local
- **Como** engenheiro de dados (P2)  
- **Quero** comparar `enriquecido/dt=2022-01-01` AWS vs. local  
- **Para** validar migração brownfield  
- **Status:** backlog · **Onda:** W3 · **Depende:** E3-US01

**Critérios de aceite:**
- [ ] Colunas `_*` batem em amostra ou dataset completo do dia teste
- [ ] Somas de `_revenue` e contagem `_stockout` conferem

---

## Épico E4 · Orquestração (Onda W4)

### E4-US01 · processar_dia orquestrado
- **Como** esteira (P2)  
- **Quero** Step Functions executando origem → enriquecido para um `dt`  
- **Para** replicar `processar_dia(dt)`  
- **Status:** backlog · **Onda:** W4 · **Depende:** E3-US01

**Critérios de aceite:**
- [ ] Estado de falha se origem ou enriquecimento falhar
- [ ] Retry configurado onde fizer sentido
- [ ] Execução testada para 3 `dt` consecutivos (ex.: 2022-01-01 a 03)

---

### E4-US02 · Agendamento diário
- **Como** operação (P2)  
- **Quero** EventBridge disparando a esteira todo dia  
- **Para** simular `DATA_EXECUCAO` = hoje  
- **Status:** backlog · **Onda:** W4 · **Depende:** E4-US01

**Critérios de aceite:**
- [ ] Cron configurado (horário documentado)
- [ ] `dt` processado = dia anterior (lógica D-1)
- [ ] Possibilidade de desabilitar rule em sandbox

---

### E4-US03 · Rastreabilidade de execução
- **Como** plataforma (P4)  
- **Quero** logs estruturados por execução  
- **Para** auditar qual `dt` foi processado  
- **Status:** backlog · **Onda:** W4 · **Depende:** E4-US01

**Critérios de aceite:**
- [ ] CloudWatch Logs com `execution_id`, `dt`, status
- [ ] Link execução Step Functions → logs

---

## Épico E5 · Relatório D-1 (Onda W5)

### E5-US01 · Excel D-1 no S3
- **Como** analista (P1)  
- **Quero** relatório D-1 em Excel após a esteira rodar  
- **Para** ver ranking de produtos e receita do dia D-1  
- **Status:** backlog · **Onda:** W5 · **Depende:** E4-US01

**Critérios de aceite:**
- [ ] Lê partição `enriquecido/dt={DIA_DADO}`
- [ ] Agrega por `Product ID` + `Category` (soma lojas)
- [ ] Arquivo: `relatorio_D1_exec{DATA_EXECUCAO}_dado{DIA_DADO}.xlsx`
- [ ] Insight no topo + fórmulas Excel (como notebook §3)

---

### E5-US02 · Entrega ao analista
- **Como** analista (P1)  
- **Quero** acessar o relatório sem Jupyter  
- **Para** usar no dia a dia  
- **Status:** backlog · **Onda:** W5 · **Depende:** E5-US01

**Critérios de aceite:**
- [ ] Path fixo em `relatorios/D1/`
- [ ] Mecanismo de acesso documentado (console S3, URL pré-assinada, etc.)

---

### E5-US03 · Paridade relatório D-1
- **Como** analista (P1)  
- **Quero** mesmo ranking e totais que o notebook para o mesmo `dt`  
- **Para** validar a migração  
- **Status:** backlog · **Onda:** W5 · **Depende:** E5-US01

**Critérios de aceite:**
- [ ] Top 3 produtos iguais ao Excel local de referência
- [ ] Totais de unidades e receita conferem

---

## Épico E6 · Relatórios D-2 e D-3 (Onda W6)

### E6-US01 · Relatório D-2 — reposição
- **Como** gestor de compras (P3)  
- **Quero** Excel listando rupturas por loja × produto  
- **Para** priorizar reposição por `_lost`  
- **Status:** backlog · **Onda:** W6 · **Depende:** E5-US01

**Critérios de aceite:**
- [ ] Filtra `_stockout == 1` e `_lost > 0`
- [ ] Ordenação por impacto (`_lost` desc)
- [ ] Naming `relatorio_D2_exec*_dado*`

---

### E6-US02 · Relatório D-3 — tendência
- **Como** gestor de compras (P3)  
- **Quero** Excel com tendência de consumo em janela histórica  
- **Para** ajustar estoque mínimo e compra  
- **Status:** backlog · **Onda:** W6 · **Depende:** E4-US01

**Critérios de aceite:**
- [ ] Usa N partições `dt=` (janela configurável)
- [ ] Considera `_is_weekend` na leitura
- [ ] Naming `relatorio_D3_exec*_dado*`
- [ ] Alinhado à lógica a definir no notebook (hoje planejado, não implementado)

---

## Épico E7 · Operação e consulta (Onda W6)

### E7-US01 · Athena sobre enriquecido
- **Como** analista (P1)  
- **Quero** consultar partições via SQL  
- **Para** validações ad hoc sem baixar parquet  
- **Status:** backlog · **Onda:** W6 · **Depende:** E3-US01

**Critérios de aceite:**
- [ ] Glue Data Catalog / tabela externa em `enriquecido/dt=`
- [ ] Query de exemplo documentada (ex.: top rupturas do dia)

---

### E7-US02 · Alarme de falha da esteira
- **Como** plataforma (P4)  
- **Quero** notificação se a execução diária falhar  
- **Para** não perder o D-1 sem saber  
- **Status:** backlog · **Onda:** W6 · **Depende:** E4-US01

**Critérios de aceite:**
- [ ] CloudWatch Alarm em falha Step Functions
- [ ] Destino de alerta configurado (e-mail/SNS)

---

## Resumo quantitativo

| Épico | Stories | Onda |
|-------|---------|------|
| E1 Fundação | 4 | W1 |
| E2 Origem | 3 | W2 |
| E3 Enriquecimento | 3 | W3 |
| E4 Orquestração | 3 | W4 |
| E5 Relatório D-1 | 3 | W5 |
| E6 D-2 / D-3 | 2 | W6 |
| E7 Operação | 2 | W6 |
| **Total** | **20** | **6 ondas** |

---

## INVEST checklist (todas as stories)

| Critério | Como atendemos |
|----------|----------------|
| Independent | Dependências explícitas por ID |
| Negotiable | Escopo por onda; D-3 pode detalhar após notebook |
| Valuable | Cada story entrega valor a P1–P4 |
| Estimable | Ondas W1–W6 com esforço no roadmap |
| Small | 1 story ≈ 1 capacidade deployável ou validação |
| Testable | Critérios de aceite com checkbox |
