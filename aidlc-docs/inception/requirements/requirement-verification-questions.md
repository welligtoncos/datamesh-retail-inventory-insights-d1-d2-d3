# Requirement Verification Questions

**Projeto:** datamesh-retail-inventory-insights-d1-d2-d3  
**Escopo desta rodada:** Onda W1 (E1-US01 a E1-US04)  
**Data:** 2026-06-28

> Decisões já informadas pelo solicitante foram pré-preenchidas. Itens fora de W1 ficam registrados para ondas futuras.

---

## Decisões de infraestrutura (W1)

### Q1. Região AWS
Qual região hospedará os recursos da esteira?

A) us-east-1  
B) sa-east-1  
C) us-west-2  
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

### Q2. IaC (Infrastructure as Code)
Como provisionar S3 e IAM?

A) Terraform  
B) AWS CDK (Python)  
C) Console manual  
X) Other (please describe after [Answer]: tag below)

[Answer]: A — Terraform como escolha primária; CDK Python permanece alternativa documentada.

---

### Q3. Estratégia de bucket S3
Quantos buckets para ambiente dev?

A) Um bucket com prefixos (`insumo/`, `origem/`, `enriquecido/`, `relatorios/`)  
B) Um bucket por camada (4 buckets)  
C) Um bucket por ambiente + prefixos  
X) Other (please describe after [Answer]: tag below)

[Answer]: A — bucket único `retail-inventory-insights-dev`

---

### Q4. Ambiente alvo desta rodada
Qual ambiente construir agora?

A) dev  
B) staging  
C) prod  
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Escopo W1

### Q5. Serviços AWS nesta rodada
O que NÃO implementar agora?

A) Apenas S3 + IAM (sem Glue, Lambda, Step Functions)  
B) S3 + IAM + Glue stub  
C) Stack completa W1–W4  
X) Other (please describe after [Answer]: tag below)

[Answer]: A — conforme solicitado: NÃO implementar Glue, Lambda, Step Functions ainda.

---

### Q6. Upload do CSV insumo
Como o `retail_store_inventory.csv` chega ao S3?

A) Upload manual via console/CLI (documentado)  
B) Terraform `aws_s3_object` no apply  
C) Script Python separado no repo  
X) Other (please describe after [Answer]: tag below)

[Answer]: A — upload manual documentado; Terraform cria bucket/prefixos/IAM apenas.

---

## Decisões fora de W1 (registro para ondas futuras)

### Q7. Entrega do Excel D-1 (W5)
Onde o analista acessa o relatório?

A) S3 apenas (`relatorios/D1/`)  
B) E-mail (SES)  
C) Ambos  
X) Other (please describe after [Answer]: tag below)

[Answer]: A — default dev; revisar na W5.

---

### Q8. Horário cron EventBridge (W4)
Quando a esteira diária deve rodar?

A) 06:00 UTC  
B) 09:00 America/Sao_Paulo  
C) Manual apenas (sem cron em dev)  
X) Other (please describe after [Answer]: tag below)

[Answer]: C — dev sem cron; EventBridge na W4.

---

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A — W1 é IAM least privilege; baseline de segurança aplicável a S3/IAM.

---

## Question: Resiliency Extensions
Should the resiliency baseline be applied to this project?

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B — ambiente dev W1 infra-only; resiliency completa nas ondas W4–W6.

---

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints

B) Partial — enforce PBT rules only for pure functions and serialization round-trips

C) No — skip all PBT rules

X) Other (please describe after [Answer]: tag below)

[Answer]: C — W1 sem lógica de negócio; PBT relevante a partir de W2/W3.

---

## Validação

Todas as respostas foram analisadas. Sem ambiguidades bloqueantes para W1.

**Status:** ✅ Completo — pronto para gerar `requirements.md`
