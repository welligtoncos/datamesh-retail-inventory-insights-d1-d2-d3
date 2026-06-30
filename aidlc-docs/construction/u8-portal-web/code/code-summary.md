# Code Summary · U8 Portal Web (E8-US02)

**Data:** 2026-06-30  
**Story:** E8-US02 · Login Cognito no Angular

## Artefatos gerados

| Path | Descrição |
|------|-----------|
| `portal-web/` | Angular 19 SPA + Material + Cognito OAuth |
| `portal-web/src/app/core/auth/` | AuthService, guard, interceptor, config |
| `portal-web/src/app/features/login/` | Tela login Hosted UI |
| `portal-web/src/app/features/home/` | Home mínima + teste API |
| `portal-web/src/environments/` | dev local + production CloudFront |
| `scripts/w7-deploy-portal-web.ps1` | Build + S3 sync + invalidação CF |
| `scripts/w7-us02-validate.ps1` | Build + testes + checklist manual |

## Critérios de aceite

| Critério | Implementação |
|----------|---------------|
| Hosted UI Cognito | `AuthService.login()` → `initCodeFlow()` |
| JWT interceptor | `authInterceptor` em `apiBaseUrl` |
| Logout | `logout()` + Cognito hosted UI logout URL |
| Auth guard | `authGuard` em `/home` |
| RF-M6-01, RF-M6-02 | Rastreado |

## Testes automatizados

- `auth.guard.spec.ts` (2 casos)
- `auth.interceptor.spec.ts` (3 casos)
- `ng test` — 6 SUCCESS

## Próximo

- E8-US03 — Shell Angular e home dashboard completo
- Deploy CloudFront: `.\scripts\w7-deploy-portal-web.ps1`
- Login manual com `teste@empresa.com`
