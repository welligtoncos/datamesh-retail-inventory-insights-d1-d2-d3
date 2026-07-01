import { InsumoItem } from './models/insumo.model';

/** Ordena por last_modified descendente (mais recente primeiro). */
export function sortInsumosByLastModifiedDesc(items: InsumoItem[]): InsumoItem[] {
  return [...items].sort(
    (a, b) => new Date(b.last_modified).getTime() - new Date(a.last_modified).getTime(),
  );
}
