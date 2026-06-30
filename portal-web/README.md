# Portal Web · Datamesh W7 (E8-US02)

Angular SPA com autenticação **Amazon Cognito** (Hosted UI + OAuth2 code + PKCE).

## Pré-requisitos

- Node.js 20+
- AWS CLI (para deploy)
- Usuário Cognito no pool `us-east-1_yJLzwZgZE`

## Desenvolvimento local

```powershell
cd portal-web
npm ci
npm start
```

Abra http://localhost:4200 — callback Cognito registrado: `http://localhost:4200/`

## Build

```powershell
npm run build
```

Artefatos em `dist/portal-web/browser/`.

## Deploy (dev)

Na raiz do repositório:

```powershell
.\scripts\w7-deploy-portal-web.ps1
```

## Validação E8-US02

```powershell
.\scripts\w7-us02-validate.ps1
```

## Configuração

| Arquivo | Uso |
|---------|-----|
| `src/environments/environment.ts` | Local (`ng serve`) |
| `src/environments/environment.production.ts` | CloudFront build |

## Rotas

| Rota | Proteção |
|------|----------|
| `/login` | Pública |
| `/home` | AuthGuard |

## Stack

- Angular 19 · Angular Material
- `angular-oauth2-oidc` 19
- JWT via `authInterceptor` → API Gateway BFF
