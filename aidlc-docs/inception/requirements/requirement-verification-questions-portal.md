# Requirement Verification Questions · Portal Web (W7)

**Projeto:** datamesh-retail-inventory-insights-d1-d2-d3  
**Escopo desta rodada:** Épico W7 — Portal Web de gestão (insumos, enriquecidos, insights D-1/D-2/D-3)  
**Data:** 2026-06-29  
**Referência:** [`diagrams/09-portal-web.mmd`](../../../diagrams/09-portal-web.mmd)

> Preencha cada `[Answer]:` abaixo. Decisões marcadas como **provisional** no plano de requisitos dependem destas respostas.

---

## Stack e arquitetura

### Q1. Framework do frontend (validação pendente)

Qual stack usar no frontend do portal?

A) **Angular** (preferência atual — SPA com TypeScript, RxJS, Angular Material)

B) React + Next.js (SSR/SSG, alinhado ao diagrama 09 original)

C) React SPA (Vite) sem Next.js

D) Vue 3 + Vuetify

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q2. Backend / API (BFF)

Como expor a API consumida pelo frontend?

A) **API Gateway HTTP + Lambda** (funções separadas por domínio: insumos, particoes, pipeline, insights, athena)

B) API Gateway + **ECS/Fargate** (NestJS ou FastAPI monolito)

C) **Amplify Gen 2** (frontend + backend integrado)

D) AppSync GraphQL + Lambda resolvers

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Q3. Linguagem do backend

Se Lambda ou container, qual runtime preferido?

A) **Python 3.12** (paridade com Glue/Lambda relatórios existentes)

B) TypeScript/Node.js (paridade com Angular no mesmo ecossistema)

C) Java/Spring Boot

D) .NET

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q4. Autenticação e autorização

Como usuários acessam o portal?

A) **Amazon Cognito** (User Pool + grupos por persona: TI, Analista, Gestor, Diretoria)

B) SSO corporativo (SAML/OIDC — ex.: Azure AD, Okta)

C) Apenas em dev: auth simplificada / API key (sem Cognito ainda)

D) Cognito + SSO federado (híbrido)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q5. Hospedagem do frontend Angular

Onde servir a SPA?

A) **S3 estático + CloudFront** (padrão AWS, desacoplado do backend)

B) Amplify Hosting

C) ECS + nginx

D) Somente local em dev (decidir prod depois)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Escopo funcional (MVP vs completo)

### Q6. Prioridade do MVP (fase 1)

Quais módulos entram na **primeira entrega**?

A) **Insights only** — D-1, D-2, D-3 (visualização + download Excel); sem upload nem pipeline

B) Insights + **Enriquecido/Origem** (partições, preview, métricas)

C) **Completo** — Insumos + Origem + Enriquecido + Insights + Operações (disparo SFN)

D) Insumos + Pipeline + Operações (foco TI); insights na fase 2

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Q7. Upload de insumo via portal

O portal deve substituir upload manual CLI/S3?

A) Sim — upload CSV com validação das **15 colunas** no portal

B) Sim — upload + validação + **pré-visualização** das primeiras linhas

C) Não na fase 1 — manter upload CLI; portal só lista insumos existentes

D) Upload via **presigned URL** (browser → S3 direto; portal só valida metadata)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Q8. Disparo da esteira (`processar_dia`)

Quem pode acionar Step Functions pelo portal?

A) Apenas persona **TI / Eng. dados**

B) TI + **Analista** (com confirmação dupla)

C) Qualquer usuário autenticado

D) Não expor na fase 1 — manter scripts PowerShell existentes

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

### Q9. Explorador SQL (Athena)

Incluir consulta SQL ad hoc no portal?

A) Sim — editor SQL com queries salvas e limite de resultados

B) Sim — apenas **queries pré-aprovadas** (templates do `athena-validation-queries.md`)

C) Não — analistas continuam no console Athena

D) Fase 2 — MVP só dashboards D-1/D-2/D-3

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Q10. Visualização de insights

Como exibir D-1/D-2/D-3 na tela?

A) **Tabela interativa** no browser (agrega Parquet/enriquecido via API) + botão download Excel do S3

B) Apenas **link/download** do Excel já gerado pela Lambda

C) Tabela interativa + **gráficos** (ranking, rupturas, tendência)

D) Embed do Excel (Office Online / Google — se disponível)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Ambiente e integração

### Q11. Ambiente alvo desta rodada

Onde deployar o portal primeiro?

A) **dev** (`retail-inventory-insights-dev-use1`, us-east-1)

B) dev + staging

C) Apenas local (sem AWS até validar Angular)

D) prod direto

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q12. Multi-tenant / multi-loja

O portal atende uma ou várias empresas/tenants?

A) **Single-tenant** — uma empresa, um bucket (cenário atual)

B) Multi-tenant — isolamento por Cognito group + prefixo S3

C) Multi-loja dentro de um tenant (filtro Store ID na UI)

D) Decidir na fase 2

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q13. IaC do portal

Como provisionar infra do portal?

A) **Terraform** no mesmo repo (`terraform/modules/portal/`)

B) AWS CDK (TypeScript — alinhado a Angular)

C) SAM / Serverless Framework

D) Console manual em dev; IaC na fase 2

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## UX e personas

### Q14. Idioma da interface

A) **Português (BR)** apenas

B) Português + English

C) English apenas

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q15. Restrição de telas por persona

A) **RBAC completo** — Gestor vê D-2/D-3; Diretoria D-1; TI tudo; Analista D+partições+Athena

B) Todos veem tudo (auth só para audit)

C) RBAC configurável por admin no portal

D) Definir na fase 2

X) Other (please describe after [Answer]: tag below)

[Answer]: D

---

## Extensions (AI-DLC)

### Q16. Security Extensions

Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q17. Resiliency Extensions

Should the resiliency baseline be applied to this project?

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

### Q18. Property-Based Testing Extension

Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints

B) Partial — enforce PBT rules only for pure functions and serialization round-trips

C) No — skip all PBT rules

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Validação

**Status:** ✅ Completo — 2026-06-29

Respostas analisadas. Tensões Q6×Q7 e Q8×Q15 documentadas em `portal-requirements.md`. Pronto para User Stories W7.
