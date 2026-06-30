# Story Generation Plan · W7 Portal Web

**Data:** 2026-06-29  
**Fonte:** [`portal-requirements.md`](../requirements/portal-requirements.md) (aprovado)  
**Assessment:** [`user-stories-assessment-w7.md`](user-stories-assessment-w7.md)

---

## Decisões de planejamento (derivadas dos requirements)

### Q1. Abordagem de breakdown

A) User Journey-Based  
B) Feature-Based  
C) Persona-Based  
D) **Epic-Based** (E8, alinhado E1–E7)  
X) Other

[Answer]: D — Epic-Based com sub-agrupamento por camada (infra, BFF, Angular, E2E)

---

### Q2. Granularidade das stories

A) 1 story por módulo M1–M7 (6 stories)  
B) **~12 stories** (1 capacidade deployável ou par feature/API+UI)  
C) 20+ micro-stories  
X) Other

[Answer]: B — 12 stories E8-US01…E8-US12

---

### Q3. Formato das stories

A) Formato livre  
B) **Como E1–E7** (Como/Quero/Para + critérios checkbox)  
C) Gherkin Given/When/Then  
X) Other

[Answer]: B — mesmo formato `stories.md` existente

---

### Q4. Personas

A) Reutilizar P1–P4 apenas  
B) **Estender P1–P4** + nota portal em `personas.md`  
C) Novas personas P5–P8  
X) Other

[Answer]: B — estender personas existentes com seção Portal W7

---

### Q5. Priorização dentro de W7

A) Infra → BFF → Angular (sequencial)  
B) **Infra → Auth/Shell → paralelo dados+insights**  
C) Frontend-first com mocks  
X) Other

[Answer]: A — Infra primeiro; BFF antes de Angular por feature

---

### Q6. RBAC nas stories W7

A) Stories com guards por persona  
B) **Auth apenas; RBAC fase 2** (conforme Q15 requirements)  
C) Sem auth em dev  
X) Other

[Answer]: B — Cognito login; todos os módulos visíveis para autenticados

---

## Plano de execução

- [x] Validar assessment W7
- [x] Definir breakdown Epic-Based (12 stories)
- [x] Mapear RF-M* e RF-API-* → E8-US*
- [x] Gerar/atualizar `personas.md` (seção Portal)
- [x] Adicionar Épico E8 em `stories.md`
- [x] Atualizar `backlog-roadmap.md` com W7
- [x] Atualizar `aidlc-state.md`
- [x] Registrar aprovação em `audit.md`

## Artefatos obrigatórios

- [x] `aidlc-docs/inception/user-stories/stories.md` — E8-US01…12
- [x] `aidlc-docs/inception/user-stories/personas.md` — extensão portal
- [x] INVEST + critérios de aceite por story

**Status plano:** ✅ Aprovado 2026-06-29 (via Approve & Continue requirements)
