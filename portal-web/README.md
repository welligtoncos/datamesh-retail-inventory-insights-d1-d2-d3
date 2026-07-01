# Portal Web · Datamesh W7 (E8-US02 … E8-US07)

Angular SPA com autenticação **Amazon Cognito**, **app shell**, módulos **Insumos** (M1), **Origem** (M2), **Enriquecido** (M3) e **Insight D-1** (M4).

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

Abra [http://localhost:4200](http://localhost:4200) — callback Cognito registrado: `http://localhost:4200/`

## Build

```powershell
npm run build:prod
```

Artefatos em `dist/portal-web/browser/`.

## Deploy (dev)

Na raiz do repositório:

```powershell

```



## Validação

```powershell
.\scripts\w7-us02-validate.ps1   # auth Cognito
.\scripts\w7-us03-validate.ps1   # shell + home dashboard
.\scripts\w7-us04-validate.ps1   # listar insumos M1
.\scripts\w7-us05-validate.ps1   # particoes origem + preview M2
.\scripts\w7-us06-validate.ps1   # enriquecido KPIs + comparativo M3
.\scripts\w7-us07-validate.ps1   # insight D-1 ranking + download M4
```



## Configuração


| Arquivo                                      | Uso                |
| -------------------------------------------- | ------------------ |
| `src/environments/environment.ts`            | Local (`ng serve`) |
| `src/environments/environment.production.ts` | CloudFront build   |




## Rotas


| Rota                     | Proteção  | Descrição                       |
| ------------------------ | --------- | ------------------------------- |
| `/login`                 | Pública   | Login Cognito                   |
| `/home`                  | AuthGuard | Home dashboard (KPIs + atalhos) |
| `/insumos`               | AuthGuard | Tabela arquivos S3 `insumo/`    |
| `/origem`                | AuthGuard | Partições origem + preview M2 |
| `/enriquecido`           | AuthGuard | KPIs enriquecido + comparativo M3 |
| `/insights/d1`           | AuthGuard | Dashboard D-1 ranking + insight M4 |
| `/insights/d2` …         | AuthGuard | Placeholder até E8-US08         |




## Stack

- Angular 19 · Angular Material · CDK Layout
- `angular-oauth2-oidc` 19
- JWT via `authInterceptor` → API Gateway BFF
- `GET /health` público (badge); KPIs, insumos, origem, enriquecido e insights mock até E8-US12 (FastAPI BFF)
