export function normalizeEnriquecidoDt(dt: string): string {
  return dt.trim().slice(0, 10);
}

export function sortEnriquecidoPartitionsDesc(partitions: string[]): string[] {
  return [...partitions].map(normalizeEnriquecidoDt).sort((a, b) => b.localeCompare(a));
}

export function firstEnriquecidoDt(partitions: string[]): string | null {
  const sorted = sortEnriquecidoPartitionsDesc(partitions);
  return sorted[0] ?? null;
}

export function defaultComparePair(partitions: string[]): {
  dt_a: string | null;
  dt_b: string | null;
} {
  const sorted = sortEnriquecidoPartitionsDesc(partitions);
  if (sorted.length < 2) {
    return { dt_a: null, dt_b: null };
  }
  return { dt_a: sorted[1], dt_b: sorted[0] };
}
