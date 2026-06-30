# NFR Requirements · U8 Portal Web Shell (E8-US03)

**Story:** E8-US03  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| NFR-UX-01 | Insight em ≤ 3 cliques | Home → atalho D-1/D-2/D-3 em 1 clique (NFR-W7-05) |
| NFR-UX-02 | PT-BR | 100% strings visíveis em português (RF-M7-05) |
| NFR-UX-03 | Feedback loading | Skeleton ou spinner em carregamento home |
| NFR-UX-04 | Erros compreensíveis | Sem stack trace ou JSON cru na UI (RF-M7-03) |

---

## Responsividade (RF-M7-04)

| ID | Breakpoint | Requisito |
|----|------------|-----------|
| NFR-RESP-01 | ≥ 960px | Sidenav fixo lateral; grid KPI 3 colunas |
| NFR-RESP-02 | 600–959px | Sidenav overlay; grid KPI 2 colunas |
| NFR-RESP-03 | &lt; 600px | Menu hamburger; grid KPI 1 coluna |

---

## Performance

| ID | Meta |
|----|------|
| NFR-PERF-01 | Home interativa &lt; 2s após login (com mock) |
| NFR-PERF-02 | Bundle incremental shell &lt; +150 KB gzip vs E8-US02 |
| NFR-PERF-03 | Health poll 60s — não bloquear UI |

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito E8-US03 |
|---------|-----------|-------------------|
| SECURITY-03 | Sim | Não logar KPIs sensíveis com PII no console produção |
| SECURITY-06 | Sim | Herda sessionStorage E8-US02 |
| SECURITY-07 | Sim | Mock data sem secrets; sem hardcode credenciais |

### NFR-SEC-01
Rotas placeholder permanecem protegidas por `authGuard` (sem bypass).

### NFR-SEC-02
`GET /health` é público — **não** enviar JWT (exceção no interceptor ou URL fora de escopo token).

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Sim | Timeout HTTP 30s (`portal-requirements` NFR-W7-03) |
| RESILIENCY-03 | Sim | 401 na home → logout + mensagem sessão expirada |

### NFR-RES-01
Falha API enriquecido **não** impede renderização da home (fallback mock).

### NFR-RES-02
Health check falha isolada — badge offline sem derrubar shell.

### NFR-RES-03
Retry manual via botão "Tentar novamente" na home.

---

## Property-Based Testing (PBT)

### NFR-PBT-01
`ApiErrorService`: para qualquer `status` em `{0,401,403,404,500,502,503}`, mensagem PT-BR não vazia.

### NFR-PBT-02
`DashboardService`: se partitions vazio → `ultimo_dt: null` e mensagem vazio (sem exceção).

### NFR-PBT-03
`shell-nav.config`: ordem dos itens invariante (Insumos antes de Origem, etc.).

---

## i18n

| ID | Meta |
|----|------|
| NFR-I18N-01 | PT-BR apenas (NFR-W7-08) — sem ngx-translate nesta story |

---

## Extension compliance (planejado E8-US03)

| Extension | Status esperado |
|-----------|-----------------|
| Security Baseline | Compliant (auth herdado, sem token em /health) |
| Resiliency Baseline | Compliant (mock fallback, timeout, retry) |
| Property-Based Testing | Compliant (3 unit specs mínimos) |
