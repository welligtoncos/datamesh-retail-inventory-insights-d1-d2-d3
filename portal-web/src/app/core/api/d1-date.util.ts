export function normalizeD1Dt(dt: string): string {
  return dt.trim().slice(0, 10);
}

export function addOneDayIso(dt: string): string {
  const normalized = normalizeD1Dt(dt);
  const date = new Date(`${normalized}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function yesterdayIso(dt: string): string {
  const normalized = normalizeD1Dt(dt);
  const date = new Date(`${normalized}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

/** Default dado D-1: ontem relativo à partição mais recente, se existir. */
export function defaultD1Dt(partitions: string[], latest?: string): string | null {
  if (partitions.length === 0) {
    return null;
  }

  const sorted = [...partitions].sort().reverse();
  const reference = latest && partitions.includes(latest) ? latest : sorted[0];
  const yesterday = yesterdayIso(reference);

  if (partitions.includes(yesterday)) {
    return yesterday;
  }

  const older = sorted.find((dt) => dt < reference);
  if (older) {
    return older;
  }

  return sorted[sorted.length - 1] ?? null;
}
