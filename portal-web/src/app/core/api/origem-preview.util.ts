export const PREVIEW_PAGE_SIZE = 50;
export const PREVIEW_MAX_ROWS = 500;

export function clampPreviewTotalRows(rowCount: number): number {
  return Math.min(Math.max(0, rowCount), PREVIEW_MAX_ROWS);
}

export function slicePreviewPage<T>(
  rows: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (Math.max(1, page) - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}
