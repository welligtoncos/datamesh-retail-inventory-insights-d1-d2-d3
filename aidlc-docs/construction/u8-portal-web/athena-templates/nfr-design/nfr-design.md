# NFR Design · U8 Portal Web Athena Templates (E8-US11)

**Data:** 2026-07-01

---

## athena-template-params.util

```typescript
export const ATHENA_MAX_ROWS = 100;
export const ATHENA_DEFAULT_LIMIT = 10;
export const ATHENA_MIN_DTS = 2;
export const ATHENA_MAX_DTS = 7;

export function normalizeAthenaDts(dts: string[]): string[] {
  return [...new Set(dts.map((d) => d.trim()))].filter(Boolean).sort();
}

export function validateAthenaParams(
  template: AthenaTemplateDefinition,
  params: AthenaQueryParams,
): { valid: boolean; errors: string[]; normalized: AthenaQueryParams } {
  // dt required check, dts length, limit cap, ISO date regex
}
```

---

## AthenaFacadeService

```typescript
runTemplate(
  templateId: string,
  params: AthenaQueryParams,
): Observable<AthenaQueryResult> {
  const validation = validateAthenaParams(getTemplateById(templateId)!, params);
  if (!validation.valid) {
    return throwError(() => new Error(validation.errors.join(' ')));
  }
  return this.api.queryTemplate({ template_id: templateId, params: validation.normalized }).pipe(
    map((response) => ({ response, data_source: 'api', loaded_at: new Date() })),
    catchError(() => of(this.mockResult(templateId, validation.normalized))),
  );
}
```

Mock delay opcional 300ms para simular RUNNING na UI (toggle dev).

---

## athena-results-mock.data.ts

| template_id | Mock highlight (dt=2022-01-01) |
|-------------|-------------------------------|
| `partition_sanity` | linhas=100, receita=879026.03 |
| `d1_totals` | produtos=69, unidades=14484 |
| `d2_stockouts` | 0 linhas (pct_stockout 0%) |
| `d1_top_products` | top P0014, P0015, P0002 |

Gerar rows via agregação sobre `getMockEnriquecidoRows(dt)` onde possível (PBT paridade).

---

## EnriquecidoAthenaPageComponent

- `ActivatedRoute.queryParamMap` → `dt`, `template` (opcional)
- `EnriquecidoFacadeService.loadPartitions()` para options de `dt`/`dts`
- Layout: 2 colunas desktop; stack mobile
- `running` signal durante POST

---

## AthenaResultsTableComponent

- `displayedColumns = input.required<string[]>()`
- `dataSource = input.required<Record<string, unknown>[]>()`
- Formatação numérica: `number` pipe pt-BR para colunas conhecidas (`receita`, `linhas`)

---

## HTTP timeout

```typescript
// athena-api.service.ts
this.http.post(url, body, { headers, /* timeout via interceptor or context 60s */ })
```

Reusar padrão global se existir; senão `HttpContext` com timeout 60_000 ms apenas neste POST.

---

## Extension compliance (design)

| Extension | Implementação |
|-----------|---------------|
| Security | Whitelist + JWT; sem SQL client |
| Resiliency | catchError → mock; spinner cleanup |
| PBT | `athena-template-params.util.spec.ts` |
