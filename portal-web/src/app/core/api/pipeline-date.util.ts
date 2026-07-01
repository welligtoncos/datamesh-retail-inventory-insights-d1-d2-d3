const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizePipelineDt(value: string): string {
  const trimmed = value.trim().slice(0, 10);
  if (!ISO_DATE.test(trimmed)) {
    throw new Error('Data inválida');
  }
  const parsed = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
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

export function defaultPipelineDt(partitions: string[], queryDt?: string | null): string | null {
  if (queryDt && isValidPipelineDt(queryDt) && partitions.includes(normalizePipelineDt(queryDt))) {
    return normalizePipelineDt(queryDt);
  }
  if (partitions.length === 0) {
    return null;
  }
  const sorted = [...partitions].sort().reverse();
  return sorted[0] ?? null;
}
