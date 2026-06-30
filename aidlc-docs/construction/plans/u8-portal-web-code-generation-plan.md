# Code Generation Plan · U8 Portal Web

**Stories:** E8-US02  
**Unit:** U8-Portal-Web  
**Status:** Part 1 — aguardando aprovação  
**Data:** 2026-06-30

---

## Unit Context

- Brownfield: infra E8-US01 aplicada (commit e35c26c)
- Novo app em `portal-web/` (workspace root)
- BFF ainda nginx — testes API: 401 sem token, ≠401 com token
- Dependência: outputs Terraform portal_*

---

## Steps

- [ ] Step 1: Scaffold Angular 19 + Angular Material em `portal-web/` (`ng new` estrutura standalone)
- [ ] Step 2: Adicionar `angular-oauth2-oidc` e configurar `provideOAuthClient` em `app.config.ts`
- [ ] Step 3: Criar `src/environments/environment.ts`, `environment.local.ts`, `environment.prod.ts` com valores dev Cognito/API
- [ ] Step 4: Implementar `core/auth/auth.service.ts` (login, logout, callback, `isAuthenticated$`)
- [ ] Step 5: Implementar `core/auth/auth.guard.ts` e `core/auth/auth.interceptor.ts`
- [ ] Step 6: Criar `features/login/login.component.ts` (botão "Entrar com Cognito")
- [ ] Step 7: Criar `features/home/home.component.ts` (email do usuário + logout + teste HTTP GET API)
- [ ] Step 8: Configurar `app.routes.ts` (`/login`, `/auth/callback`, `/home`, guards)
- [ ] Step 9: Estilizar com Angular Material (toolbar mínima, PT-BR)
- [ ] Step 10: Unit tests — `auth.guard.spec.ts`, `auth.interceptor.spec.ts`
- [ ] Step 11: `scripts/w7-deploy-portal-web.ps1` (build + s3 sync + CF invalidation)
- [ ] Step 12: `scripts/w7-us02-validate.ps1` (build + test + checklist)
- [ ] Step 13: `portal-web/README.md` (dev local, deploy, teste Cognito)
- [ ] Step 14: `aidlc-docs/construction/u8-portal-web/code/code-summary.md`
- [ ] Step 15: Atualizar `stories.md` E8-US02 → `done` após validação manual

---

## Story Traceability

| Step | Critério aceite E8-US02 |
|------|-------------------------|
| 4–5 | Hosted UI + JWT interceptor |
| 4 | Logout limpa sessão |
| 5, 8 | Auth guard rotas protegidas |
| 3, 11 | Deploy CloudFront |
| 10 | PBT mínimo (extensions) |

---

## Arquivos principais (previstos)

```text
portal-web/
├── src/app/core/auth/
│   ├── auth.service.ts
│   ├── auth.guard.ts
│   ├── auth.interceptor.ts
│   ├── auth.guard.spec.ts
│   └── auth.interceptor.spec.ts
├── src/app/features/login/
├── src/app/features/home/
├── src/environments/
└── package.json

scripts/w7-deploy-portal-web.ps1
scripts/w7-us02-validate.ps1
```

---

## Não incluído neste plano

- E8-US03 shell/menu
- Terraform changes (exceto callback URL se bloquear)
- FastAPI BFF
