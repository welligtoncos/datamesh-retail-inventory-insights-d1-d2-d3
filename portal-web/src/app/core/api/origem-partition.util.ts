import { OrigemPartition } from './models/origem.model';

export function normalizeDt(dt: string): string {
  return dt.trim().slice(0, 10);
}

export function sortPartitionsDesc(partitions: string[]): string[] {
  return [...partitions].map(normalizeDt).sort((a, b) => b.localeCompare(a));
}

export function buildPartitionList(
  partitions: string[],
  missingDates: string[] = [],
): OrigemPartition[] {
  const availableDts = new Set(sortPartitionsDesc(partitions));
  const available: OrigemPartition[] = [...availableDts].map((dt) => ({
    dt,
    status: 'available',
  }));

  const missing: OrigemPartition[] = sortPartitionsDesc(missingDates)
    .filter((dt) => !availableDts.has(dt))
    .map((dt) => ({ dt, status: 'missing' as const }));

  return [...available, ...missing];
}

export function firstAvailableDt(partitions: OrigemPartition[]): string | null {
  return partitions.find((p) => p.status === 'available')?.dt ?? null;
}
