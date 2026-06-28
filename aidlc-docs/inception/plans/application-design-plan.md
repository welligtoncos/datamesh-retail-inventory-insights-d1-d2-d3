# Application Design Plan · U1 Infra S3/IAM

**Escopo:** Mínimo para W1 — sem Glue, Lambda, Step Functions  
**Data:** 2026-06-28

---

## Contexto

Design de alto nível para a unidade U1 (fundação AWS). Componentes de compute serão referenciados apenas como consumidores futuros das roles IAM.

---

## Decisões de design (pré-aprovadas)

### Component Identification
Organização Terraform modular?

A) `terraform/modules/s3` + `terraform/modules/iam` + `terraform/environments/dev`  
B) Single flat `terraform/main.tf`  
X) Other

[Answer]: A

---

### IaC tool
Confirmar Terraform como implementação?

A) Sim — Terraform HCL  
B) CDK Python  
X) Other

[Answer]: A

---

## Plano de execução

- [x] Analisar requirements.md e stories W1
- [x] Identificar componentes U1 (S3DataLake, IAMRoles, TerraformStack)
- [x] Definir interfaces mínimas (outputs Terraform)
- [x] Gerar components.md
- [x] Gerar component-methods.md (recursos Terraform / operações)
- [x] Gerar services.md (orquestração deploy)
- [x] Gerar component-dependency.md
- [x] Gerar application-design.md consolidado
- [x] Validar consistência com E1-US01…04

---

## Artefatos obrigatórios

- [x] components.md
- [x] component-methods.md
- [x] services.md
- [x] component-dependency.md
- [x] application-design.md

**Status:** Completo — design mínimo U1 gerado.
