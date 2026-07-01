# NFR Design · U8 Portal Web Operações Pipeline (E8-US09)

**Data:** 2026-06-30

---

## pipeline-date.util

```typescript
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizePipelineDt(value: string): string {
  const trimmed = value.trim().slice(0, 10);
  if (!ISO_DATE.test(trimmed)) {
    throw new Error('Data inválida');
  }
  return trimmed;
}

export function isValidPipelineDt(value: string): boolean {
  try {
    normalizePipelineDt(value);
    return true;
  } catch {
    return false;
  }
}
```

---

## pipeline-duration.util

```typescript
export function computeDurationSeconds(
  startedAt: string,
  stoppedAt: string | null,
): number | null {
  if (!stoppedAt) return null;
  const ms = new Date(stoppedAt).getTime() - new Date(startedAt).getTime();
  return Math.max(0, Math.round(ms / 1000));
}
```

---

## pipeline-console-url.util

```typescript
export function buildSfnConsoleUrl(executionArn: string, region = 'us-east-1'): string {
  const encoded = encodeURIComponent(executionArn);
  return `https://${region}.console.aws.amazon.com/states/home?region=${region}#/v2/executions/details/${encoded}`;
}
```

---

## PipelineFacadeService — polling

```typescript
private pollTimer: ReturnType<typeof setInterval> | null = null;

startPolling(executionId: string, onUpdate: (row: PipelineExecutionSummary) => void): void {
  this.stopPolling();
  this.pollTimer = setInterval(() => {
    this.getExecution(executionId).subscribe({ next: onUpdate });
  }, 15_000);
}

stopPolling(): void {
  if (this.pollTimer) {
    clearInterval(this.pollTimer);
    this.pollTimer = null;
  }
}
```

- `OperacoesPageComponent` chama `stopPolling()` em `ngOnDestroy`.

---

## pipeline-execution-mock.store

- Estado module-level ou `Injectable` singleton para persistir entre chamadas na sessão.
- `startExecution(dt, audit)` → adiciona RUNNING com `execution_id` UUID curto.
- `tick()` ou timeout 30s → transição para SUCCEEDED (dt mock `2022-01-01`/`02` → SUCCEEDED; outros → FAILED opcional para demo).
- `listExecutions(limit)` → sort `started_at` desc, slice limit.

Seed inicial: 3 execuções históricas mock (1 SUCCEEDED, 1 FAILED, 1 antiga).

---

## PipelineExecutionsTableComponent

```typescript
const DISPLAYED_COLUMNS = [
  'dt', 'status', 'started_at', 'stopped_at', 'duration_seconds', 'actions',
] as const;
```

- `status` → `mat-chip` com classes `.running`, `.succeeded`, `.failed`
- `actions` → link console se `execution_arn` presente
- Sem paginação (máx 20 fixo)

---

## PipelineActiveExecutionComponent

- Input: `execution: PipelineExecutionSummary | null`
- RUNNING: `mat-spinner` + texto
- Terminal: ícone check/cancel + resumo duração
- Output opcional: `refresh` manual

---

## Auth audit (mock)

```typescript
function buildMockAudit(claims: Record<string, string> | null): PipelineAuditEntry {
  return {
    sub: claims?.['sub'] ?? 'mock-sub',
    email: claims?.['email'],
    timestamp: new Date().toISOString(),
  };
}
```

Part 2: expor `AuthService.getSub()` se necessário.

---

## Extension compliance (design)

| Extension | Implementação planejada |
|-----------|-------------------------|
| Security | JWT interceptor; audit só leitura na UI |
| Resiliency | `stopPolling`, disable botão, catchError → mock |
| PBT | specs em `pipeline-date.util.spec.ts`, `pipeline-duration.util.spec.ts` |
