export function computeDurationSeconds(
  startedAt: string,
  stoppedAt: string | null,
): number | null {
  if (!stoppedAt) {
    return null;
  }
  const ms = new Date(stoppedAt).getTime() - new Date(startedAt).getTime();
  return Math.max(0, Math.round(ms / 1000));
}
