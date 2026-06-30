# NFR Requirements · U8 Portal Web (E8-US02)

**Story:** E8-US02  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito E8-US02 |
|---------|-----------|-------------------|
| SECURITY-01 | N/A | Sem datastore no frontend |
| SECURITY-02 | N/A | Logging de CDN/API já na infra E8-US01 |
| SECURITY-03 | Parcial | Não logar tokens, senhas ou PII no console em produção |
| SECURITY-04 | Sim | Headers de segurança via CloudFront (infra deploy) — ver Infrastructure Design |
| SECURITY-05 | Sim | PKCE obrigatório (angular-oauth2-oidc default) |
| SECURITY-06 | Sim | Tokens em sessionStorage; limpar no logout |
| SECURITY-07 | N/A | Sem secrets no client (clientId público OK para SPA) |

### NFR-SEC-01
OAuth2 authorization code com **PKCE** para SPA sem client secret.

### NFR-SEC-02
Interceptor **nunca** envia token para domínios fora de `apiBaseUrl`.

### NFR-SEC-03
`environment.prod.ts` contém apenas IDs públicos Cognito (sem senhas).

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Parcial | Timeout HTTP 30s nas chamadas de teste à API |
| RESILIENCY-02 | N/A | Sem circuit breaker nesta story |
| RESILIENCY-03 | Sim | Falha de refresh token → redirect login com mensagem clara |

### NFR-RES-01
AuthService trata erro de rede no callback sem travar a aplicação.

---

## Property-Based Testing (PBT)

### NFR-PBT-01
Testes unitários do `authGuard` com combinações: token presente/ausente/expirado.

### NFR-PBT-02
Teste de propriedade: interceptor adiciona header iff URL começa com `apiBaseUrl` e token válido.

*(Escopo mínimo — 2 specs Karma/Jest; sem Hypothesis nesta story.)*

---

## Performance

| ID | Meta |
|----|------|
| NFR-PERF-01 | First paint login < 3s em dev local |
| NFR-PERF-02 | Bundle inicial < 500 KB gzip (dev; Material tree-shake) |

---

## i18n

| ID | Meta |
|----|------|
| NFR-I18N-01 | Strings de auth em PT-BR |
