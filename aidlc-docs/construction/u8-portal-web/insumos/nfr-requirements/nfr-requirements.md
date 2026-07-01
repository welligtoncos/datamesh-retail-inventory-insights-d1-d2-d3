# NFR Requirements · U8 Portal Web Insumos (E8-US04)

**Story:** E8-US04  
**Extensions:** Security, Resiliency, PBT (habilitadas W7)

---

## Usabilidade

| ID | Requisito | Critério |
|----|-----------|----------|
| NFR-UX-01 | PT-BR | Colunas, datas e tamanhos em português |
| NFR-UX-02 | Leitura rápida | Tabela escaneável; nome como coluna principal |
| NFR-UX-03 | Feedback | Loading e empty state explícitos |

---

## Performance

| ID | Meta |
|----|------|
| NFR-PERF-01 | Tela interativa &lt; 2s com mock |
| NFR-PERF-02 | Lista típica (&lt; 50 objetos) sem paginação server-side nesta story |

---

## Segurança (Security Baseline)

| Rule ID | Aplicável | Requisito E8-US04 |
|---------|-----------|-------------------|
| SECURITY-03 | Sim | Não logar keys S3 sensíveis em produção |
| SECURITY-06 | Sim | JWT via interceptor em `GET /insumos` |
| SECURITY-07 | Sim | Mock sem credenciais AWS no client |

### NFR-SEC-01
Listagem exige autenticação Cognito (mesmo sem RBAC por persona na fase 2).

### NFR-SEC-02
Não expor bucket ARN ou IAM no frontend — apenas nomes de arquivo.

---

## Resiliência (Resiliency Baseline)

| Rule ID | Aplicável | Requisito |
|---------|-----------|-----------|
| RESILIENCY-01 | Sim | Timeout HTTP 30s (`NFR-W7-03`) |
| RESILIENCY-03 | Sim | 401 → logout + mensagem sessão expirada |

### NFR-RES-01
Falha BFF → mock fallback (mesmo padrão E8-US03).

### NFR-RES-02
Botão "Tentar novamente" recarrega lista.

---

## Property-Based Testing (PBT)

### NFR-PBT-01
`fileSizePipe`: para `size_bytes >= 0`, output não vazio e contém unidade (B/KB/MB/GB).

### NFR-PBT-02
`InsumosFacadeService`: Http 404 → `data_source === 'mock'` e `items.length >= 1`.

### NFR-PBT-03
Sort desc: para lista com 2+ items, primeiro `last_modified` >= segundo.

---

## Extension compliance (planejado)

| Extension | Status esperado |
|-----------|-----------------|
| Security Baseline | Compliant |
| Resiliency Baseline | Compliant |
| Property-Based Testing | Compliant (3 specs) |
