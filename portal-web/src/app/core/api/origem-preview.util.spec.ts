import {
  PREVIEW_MAX_ROWS,
  PREVIEW_PAGE_SIZE,
  clampPreviewTotalRows,
  slicePreviewPage,
} from './origem-preview.util';

describe('origem-preview.util', () => {
  it('clamps total rows to 500', () => {
    expect(clampPreviewTotalRows(100)).toBe(100);
    expect(clampPreviewTotalRows(600)).toBe(PREVIEW_MAX_ROWS);
    expect(clampPreviewTotalRows(-1)).toBe(0);
  });

  it('slices preview page with page_size', () => {
    const rows = Array.from({ length: 100 }, (_, i) => i);
    const page2 = slicePreviewPage(rows, 2, PREVIEW_PAGE_SIZE);
    expect(page2.length).toBe(50);
    expect(page2[0]).toBe(50);
  });
});
