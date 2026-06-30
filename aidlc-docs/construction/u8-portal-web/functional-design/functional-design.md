# Functional Design · U8 Portal Web (E8-US02)

**Story:** E8-US02  
**Data:** 2026-06-30

---

## Regras de negócio (auth)

### BR-AUTH-01 · Sessão obrigatória
Toda rota exceto `/login` e `/auth/callback` exige `access_token` válido (não expirado).

### BR-AUTH-02 · Login
Se usuário não autenticado acessa rota protegida → redirecionar para fluxo Cognito Hosted UI.

### BR-AUTH-03 · Callback OAuth
Rota `/auth/callback` processa `code` da query string, troca por tokens, redireciona para `/home`.

### BR-AUTH-04 · Interceptor API
Toda requisição HTTP para `apiBaseUrl` inclui header `Authorization: Bearer {access_token}` se token existir.

### BR-AUTH-05 · Logout
1. Chamar `oauthService.logOut()` (revoga no client)  
2. Limpar sessionStorage de tokens  
3. Redirecionar para `/login` ou Cognito logout URL  
4. Estado da aplicação: `isAuthenticated = false`

### BR-AUTH-06 · Refresh
Se `access_token` expirado e `refresh_token` válido → tentar refresh silencioso antes de forçar novo login.

### BR-AUTH-07 · RBAC
**N/A em W7** — qualquer usuário autenticado acessa todas as rotas (fase 2).

---

## Modelo de domínio (auth)

| Conceito | Atributos | Notas |
|----------|-----------|-------|
| `UserSession` | `email`, `sub`, `accessToken`, `idToken`, `expiresAt` | Derivado de claims OIDC |
| `AuthState` | `isAuthenticated`, `isLoading`, `error` | Observable no AuthService |

---

## Rotas

| Path | Guard | Componente | Público |
|------|-------|------------|---------|
| `/login` | — | LoginComponent | Sim |
| `/auth/callback` | — | (handler no AuthService) | Sim |
| `/home` | authGuard | HomeComponent | Não |
| `/` | — | redirect → `/home` | — |
| `**` | — | redirect → `/home` | — |

---

## Casos de teste (aceite manual)

| ID | Cenário | Resultado esperado |
|----|---------|-------------------|
| TC-01 | Acessar `/home` sem login | Redirect Cognito |
| TC-02 | Login com `teste@empresa.com` | Retorna `/home` com email |
| TC-03 | DevTools → chamada API | Header `Authorization` presente |
| TC-04 | Logout | `/login`; API sem token → 401 |
| TC-05 | Refresh página em `/home` | Sessão mantida (sessionStorage) |

---

## Mensagens UI (PT-BR)

| Situação | Mensagem |
|----------|----------|
| Carregando auth | "Autenticando…" |
| Erro callback | "Falha no login. Tente novamente." |
| Sessão expirada | "Sua sessão expirou. Faça login novamente." |
