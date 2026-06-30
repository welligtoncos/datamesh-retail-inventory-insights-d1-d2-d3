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
- **Status:** done · **Onda:** W3 · **Depende:** E2-US01

**Critérios de aceite:**
- [x] `_revenue = Units Sold * Price`
- [x] `_stockout` conforme notebook: vendeu estoque E forecast > estoque
- [x] `_lost` quando `_stockout == 1`
- [x] `_is_weekend` e coluna `dt`

---

### E3-US02 · Sanidade pós-enriquecimento
- **Como** analista (P1)  
- **Quero** indicadores de ruptura coerentes com §1 do notebook  
- **Para** confiar nos relatórios D-2 futuros  
- **Status:** done · **Onda:** W3 · **Depende:** E3-US01

**Critérios de aceite:**
- [x] % linhas com `_stockout=1` documentado
- [x] Desvio vs. notebook local dentro de tolerância acordada (ex.: 0% em mesmo insumo)

---

### E3-US03 · Paridade enriquecido local
- **Como** engenheiro de dados (P2)  
- **Quero** comparar `enriquecido/dt=2022-01-01` AWS vs. local  
- **Para** validar migração brownfield  
- **Status:** done · **Onda:** W3 · **Depende:** E3-US01

**Critérios de aceite:**
- [x] Colunas `_*` batem em amostra ou dataset completo do dia teste
- [x] Somas de `_revenue` e contagem `_stockout` conferem

---

## Épico E4 · Orquestração (Onda W4)

### E4-US01 · processar_dia orquestrado
- **Como** esteira (P2)  
- **Quero** Step Functions executando origem → enriquecido para um `dt`  
- **Para** replicar `processar_dia(dt)`  
- **Status:** done · **Onda:** W4 · **Depende:** E3-US01

**Critérios de aceite:**
- [x] Estado de falha se origem ou enriquecimento falhar
- [x] Retry configurado onde fizer sentido
- [x] Execução testada para 3 `dt` consecutivos (ex.: 2022-01-01 a 03)

---

### E4-US02 · Agendamento diário
- **Como** operação (P2)  
- **Quero** EventBridge disparando a esteira todo dia  
- **Para** simular `DATA_EXECUCAO` = hoje  
- **Status:** done · **Onda:** W4 · **Depende:** E4-US01

**Critérios de aceite:**
- [x] Cron configurado (horário documentado)
- [x] `dt` processado = dia anterior (lógica D-1)
- [x] Possibilidade de desabilitar rule em sandbox

---

### E4-US03 · Rastreabilidade de execução
- **Como** plataforma (P4)  
- **Quero** logs estruturados por execução  
- **Para** auditar qual `dt` foi processado  
- **Status:** done · **Onda:** W4 · **Depende:** E4-US01

**Critérios de aceite:**
- [x] CloudWatch Logs com `execution_id`, `dt`, status
- [x] Link execução Step Functions → logs

---

## Épico E5 · Relatório D-1 (Onda W5)

### E5-US01 · Excel D-1 no S3
- **Como** analista (P1)  
- **Quero** relatório D-1 em Excel após a esteira rodar  
- **Para** ver ranking de produtos e receita do dia D-1  
- **Status:** done · **Onda:** W5 · **Depende:** E4-US01

**Critérios de aceite:**
- [x] Lê partição `enriquecido/dt={DIA_DADO}`
- [x] Agrega por `Product ID` + `Category` (soma lojas)
- [x] Arquivo: `relatorio_D1_exec{DATA_EXECUCAO}_dado{DIA_DADO}.xlsx`
- [x] Insight no topo + fórmulas Excel (como notebook §3)

---

### E5-US02 · Entrega ao analista
- **Como** analista (P1)  
- **Quero** acessar o relatório sem Jupyter  
- **Para** usar no dia a dia  
- **Status:** done · **Onda:** W5 · **Depende:** E5-US01

**Critérios de aceite:**
- [x] Path fixo em `relatorios/D1/`
- [x] Mecanismo de acesso documentado (console S3, URL pré-assinada, etc.)

---

### E5-US03 · Paridade relatório D-1
- **Como** analista (P1)  
- **Quero** mesmo ranking e totais que o notebook para o mesmo `dt`  
- **Para** validar a migração  
- **Status:** done · **Onda:** W5 · **Depende:** E5-US01

**Critérios de aceite:**
- [x] Top 3 produtos iguais ao Excel local de referência
- [x] Totais de unidades e receita conferem

---

## Épico E6 · Relatórios D-2 e D-3 (Onda W6)

### E6-US01 · Relatório D-2 — reposição
- **Como** gestor de compras (P3)  
- **Quero** Excel listando rupturas por loja × produto  
- **Para** priorizar reposição por `_lost`  
- **Status:** done · **Onda:** W6 · **Depende:** E5-US01

**Critérios de aceite:**
- [x] Filtra `_stockout == 1` e `_lost > 0`
- [x] Ordenação por impacto (`_lost` desc)
- [x] Naming `relatorio_D2_exec*_dado*`

---

### E6-US02 · Relatório D-3 — tendência
- **Como** gestor de compras (P3)  
- **Quero** Excel com tendência de consumo em janela histórica  
- **Para** ajustar estoque mínimo e compra  
- **Status:** done · **Onda:** W6 · **Depende:** E4-US01

**Critérios de aceite:**
- [x] Usa N partições `dt=` (janela configurável)
- [x] Considera `_is_weekend` na leitura
- [x] Naming `relatorio_D3_exec*_dado*`
- [x] Lógica mínima documentada (tendência ±5%, úteis vs FDS)

---

## Épico E7 · Operação e consulta (Onda W6)

### E7-US01 · Athena sobre enriquecido
- **Como** analista (P1)  
- **Quero** consultar partições via SQL  
- **Para** validações ad hoc sem baixar parquet  
- **Status:** done · **Onda:** W6 · **Depende:** E3-US01

**Critérios de aceite:**
- [x] Glue Data Catalog / tabela externa em `enriquecido/dt=`
- [x] Query de exemplo documentada (ex.: top rupturas do dia)

---

### E7-US02 · Alarme de falha da esteira
- **Como** plataforma (P4)  
- **Quero** notificação se a execução diária falhar  
- **Para** não perder o D-1 sem saber  
- **Status:** done · **Onda:** W6 · **Depende:** E4-US01

**Critérios de aceite:**
- [x] CloudWatch Alarm em falha Step Functions
- [x] Destino documentado (SNS opcional quando IAM permitir; alarme via script)

---

## Épico E8 · Portal Web (Onda W7)

> **Requirements:** [`portal-requirements.md`](../requirements/portal-requirements.md)  
> **Stack:** Angular · FastAPI · ECS Fargate · Cognito · Terraform `modules/portal/`

### E8-US01 · Infra Terraform do portal
- **Como** plataforma AWS (P4)  
- **Quero** módulo Terraform `portal/` com Cognito, CloudFront, S3 site, API Gateway, ECS Fargate  
- **Para** hospedar o portal em dev sem configuração manual  
- **Status:** done · **Onda:** W7 · **Depende:** W6 (esteira operacional)

**Critérios de aceite:**
- [x] `terraform/modules/portal/` provisiona recursos em us-east-1 dev
- [x] Cognito User Pool + app client para SPA
- [x] S3 + CloudFront para `portal-web` estático
- [x] API Gateway HTTP → ALB → ECS Fargate
- [x] IAM task role least privilege (S3, SFN, Athena, CW read)
- [x] Tags `Project`, `Environment=dev`, `ManagedBy=terraform`
- [x] Rastreabilidade: RF-M6-01, NFR-W7-01, NFR-W7-07
- [x] `terraform apply` dev validado (`scripts/w7-us01-validate.ps1`)

---

### E8-US02 · Login Cognito no Angular
- **Como** usuário autenticado (qualquer persona)  
- **Quero** login e logout via Cognito  
- **Para** acessar o portal com segurança  
- **Status:** in_progress · **Onda:** W7 · **Depende:** E8-US01

**Critérios de aceite:**
- [x] Redirect para hosted UI ou login embutido Cognito
- [x] JWT anexado em interceptor HTTP para API BFF
- [x] Logout limpa sessão e tokens
- [x] Rotas protegidas com auth guard
- [x] Rastreabilidade: RF-M6-01, RF-M6-02

---

### E8-US03 · Shell Angular e home dashboard
- **Como** usuário do portal  
- **Quero** menu de navegação e página inicial com resumo do dia  
- **Para** chegar aos insights em ≤ 3 cliques  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US02

**Critérios de aceite:**
- [ ] App shell com menu: Insumos, Origem, Enriquecido, Insights, Operações
- [ ] Home exibe último `dt` processado, KPIs resumidos, atalhos D-1/D-2/D-3
- [ ] Interface em PT-BR; responsivo desktop + tablet
- [ ] Mensagens de erro claras (timeout AWS, 401, 500)
- [ ] Rastreabilidade: RF-M7-01..05

---

### E8-US04 · Listar insumos (M1)
- **Como** engenheiro de dados (P2)  
- **Quero** ver arquivos em `insumo/` no portal  
- **Para** confirmar que o CSV está no data lake sem usar console S3  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US01, E8-US03

**Critérios de aceite:**
- [ ] `GET /insumos` lista objetos com nome, tamanho, LastModified
- [ ] Tela Angular exibe tabela de insumos
- [ ] Upload via portal **fora de escopo** (fase 2)
- [ ] Rastreabilidade: RF-M1-01, RF-API-02

---

### E8-US05 · Partições origem e preview (M2)
- **Como** engenheiro de dados (P2)  
- **Quero** calendário de `origem/dt=` e preview do Parquet  
- **Para** validar extração diária antes do enriquecimento  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US04

**Critérios de aceite:**
- [ ] `GET /origem/partitions` lista prefixos `dt=YYYY-MM-DD`
- [ ] `GET /origem/{dt}/preview` retorna ≤ 500 linhas paginadas
- [ ] Detalhe: row count, lojas e produtos distintos
- [ ] Indicador visual para `dt` sem partição
- [ ] Rastreabilidade: RF-M2-01..04, RF-API-04, RF-API-05

---

### E8-US06 · Partições enriquecido, KPIs e comparativo (M3)
- **Como** analista de estoque (P1)  
- **Quero** ver KPIs por `dt` e comparar dois dias  
- **Para** validar métricas `_revenue`, `_stockout`, `_lost`  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US05

**Critérios de aceite:**
- [ ] `GET /enriquecido/partitions` lista partições
- [ ] `GET /enriquecido/{dt}/kpis` retorna somas e contagens corretas
- [ ] Preview enriquecido com colunas originais + derivadas
- [ ] UI compara dt A vs dt B com delta de KPIs
- [ ] Rastreabilidade: RF-M3-01..04, RF-API-06, RF-API-07

---

### E8-US07 · Dashboard insight D-1 (M4)
- **Como** diretoria comercial (P5)  
- **Quero** ranking de produtos vendidos com insight textual  
- **Para** decidir mix e exposição com dado de ontem  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US06, E5 (Lambda D-1)

**Critérios de aceite:**
- [ ] Seletor de `dt`; default = ontem
- [ ] Tabela ranking por unidades e receita (agregação Product ID + Category)
- [ ] Insight textual (produto líder, concentração top 3)
- [ ] Download Excel via presigned URL `relatorios/D1/`
- [ ] CTA processar se partição ausente (autenticado)
- [ ] Rastreabilidade: RF-M4-01,02,05,06,07, RF-API-08, RF-API-11

---

### E8-US08 · Dashboards insights D-2 e D-3 (M4)
- **Como** gestor de compras (P3)  
- **Quero** ver rupturas priorizadas e tendência de consumo  
- **Para** definir reposições e ajustar estoque mínimo  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US07, E6 (Lambda D-2/D-3)

**Critérios de aceite:**
- [ ] D-2: tabela `_stockout==1` e `_lost>0`, ordenada por `_lost` desc
- [ ] D-3: tendência Subindo/Caindo/Estável; janela N configurável; úteis vs FDS
- [ ] Download Excel D-2 e D-3 via presigned URL
- [ ] Regras de negócio alinhadas ao notebook brownfield
- [ ] Rastreabilidade: RF-M4-03,04,05, RF-API-09, RF-API-10

---

### E8-US09 · Disparar pipeline e acompanhar execução (M5)
- **Como** usuário autenticado  
- **Quero** processar um `dt` e ver status da Step Function  
- **Para** reprocessar dia sem script PowerShell  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US05, E4 (SFN)

**Critérios de aceite:**
- [ ] `POST /pipeline/processar-dia` com body `{dt}` inicia SFN
- [ ] UI mostra RUNNING / SUCCEEDED / FAILED
- [ ] Histórico últimas 20 execuções (dt, duração, status)
- [ ] Log de auditoria com `sub` Cognito + timestamp
- [ ] Rastreabilidade: RF-M5-01..03, RF-M6-04, RF-API-12, RF-API-13

---

### E8-US10 · Alarmes CloudWatch e health na UI (M5)
- **Como** plataforma AWS (P4)  
- **Quero** ver estado do alarme SFN e saúde da API na home  
- **Para** saber se a esteira falhou sem abrir console AWS  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US09, E7-US02

**Critérios de aceite:**
- [ ] `GET /ops/alarms` retorna estado OK/ALARM do alarme SFN
- [ ] `GET /health` público para liveness
- [ ] Badge na home: esteira operacional / em alarme
- [ ] Rastreabilidade: RF-M5-04, RF-M5-05, RF-API-01, RF-API-15

---

### E8-US11 · Athena templates no portal (M3)
- **Como** analista de estoque (P1)  
- **Quero** executar queries pré-aprovadas sobre enriquecido  
- **Para** validar dados sem editor SQL livre  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US06, E7-US01

**Critérios de aceite:**
- [ ] `POST /athena/query-template` com `template_id` da lista documentada
- [ ] UI lista templates (ex.: de `athena-validation-queries.md`)
- [ ] Resultado tabular com limite de linhas
- [ ] Sem editor SQL ad hoc (fase 2)
- [ ] Rastreabilidade: RF-M3-05, RF-API-14

---

### E8-US12 · FastAPI BFF e deploy E2E dev
- **Como** engenheiro de dados (P2)  
- **Quero** BFF FastAPI com todos os endpoints e portal deployado em dev  
- **Para** demonstrar fluxo ponta a ponta: login → insight D-1 → download Excel  
- **Status:** backlog · **Onda:** W7 · **Depende:** E8-US01…E8-US11

**Critérios de aceite:**
- [ ] `portal-api/` FastAPI Python 3.12 com OpenAPI `/docs`
- [ ] Todos os endpoints RF-API-01..15 implementados (exceto upload)
- [ ] Container ECS deployado; CORS configurado para CloudFront
- [ ] Script ou doc deploy dev (`docs/portal-deploy-dev.md` ou equivalente)
- [ ] E2E manual: login → home → D-1 `dt=2022-01-01` → download Excel OK
- [ ] Rastreabilidade: NFR-W7-03, NFR-W7-06

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
| **E8 Portal Web** | **12** | **W7** |
| **Total** | **32** | **7 ondas** |

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
