# NFR Design · U8 Portal Web (E8-US02)

**Data:** 2026-06-30

---

## Segurança — padrões de implementação

### Token storage
```typescript
// angular-oauth2-oidc
OAuthService.configure({
  oidc: true,
  responseType: 'code',
  useSilentRefresh: true,
  sessionChecksEnabled: true,
  // storage: OAuthStorage padrão sessionStorage via factory
});
```

### Interceptor — allowlist de host
```typescript
if (!req.url.startsWith(environment.apiBaseUrl)) {
  return next(req); // sem token
}
const token = oauthService.getAccessToken();
if (token) {
  req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
```

### Logging
- `console.log` de tokens: **proibido** em código mergeado
- Erros de auth: mensagem genérica ao usuário; detalhe só em dev (`!environment.production`)

---

## Resiliência

| Cenário | Comportamento |
|---------|---------------|
| Callback sem `code` | Redirect `/login` + toast erro |
| Token expirado mid-session | `oauthService.refreshToken()` → falha → logout |
| API 401 | Logout opcional ou mensagem "sessão expirada" (E8-US02: redirect login) |

---

## CloudFront — headers (SECURITY-04)

Response headers policy (deploy script ou Terraform fase 2):

| Header | Valor |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'self'; connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com` |

*E8-US02: documentar no script deploy; implementação Terraform opcional se já existir hook.*

---

## Testes (PBT leve)

| Arquivo | Propriedade |
|---------|-------------|
| `auth.guard.spec.ts` | `canActivate` false quando `hasValidAccessToken` false |
| `auth.interceptor.spec.ts` | header presente iff URL matches apiBaseUrl |

---

## Extension compliance (E8-US02)

| Extension | Status |
|-----------|--------|
| Security Baseline | Compliant (PKCE, sessionStorage, no token logs, CSP doc) |
| Resiliency Baseline | Compliant (refresh fail → login) |
| Property-Based Testing | Compliant (2 unit specs mínimos) |
