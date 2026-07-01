# Code Summary · U8 Portal API (E8-US12) — Part 1 Design

**Status:** Code Generation Part 1 concluído — aguardando aprovação para Part 2  
**Data:** 2026-07-01  
**Unidade:** U8-Portal-API

---

## Entregas Part 1 (design)

| Artefato | Caminho |
|----------|---------|
| Application design | `application-design.md` |
| Functional design | `functional-design/functional-design.md` |
| NFR requirements | `nfr-requirements/nfr-requirements.md` |
| NFR design | `nfr-design/nfr-design.md` |
| Infrastructure design | `infrastructure-design/infrastructure-design.md` |
| Code generation plan | `../plans/u8-portal-api-code-generation-plan.md` |

---

## Decisões-chave

- FastAPI Python 3.12, routers por domínio, porta **80**
- Agregações D-1/D-2/D-3 via **pyarrow** + paridade Lambdas/Angular
- Athena whitelist 9 templates, poll 60s, cap 100 linhas
- JWT validado no **API GW**; BFF confia no proxy + audit claims
- ECR + ECS task update (Terraform diff mínimo)
- Presigned Excel TTL 900s

---

## Endpoints (17 rotas)

`health`, `insumos`, `origem` (2), `enriquecido` (3), `insights` d1/d2/d3 (6), `pipeline` (3), `athena`, `ops/alarms`

---

## Rastreabilidade

| Requisito | Design |
|-----------|--------|
| RF-API-01..15 (exc. 03) | application-design |
| NFR-W7-01..04, 06 | nfr-requirements |
| Persona P2 | functional-design E2E |

---

## Próximo passo

Aprovar Part 1 → **Continue to Next Stage** → implementar `portal-api/` + deploy + validate scripts.
