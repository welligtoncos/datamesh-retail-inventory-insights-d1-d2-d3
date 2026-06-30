import { SHELL_NAV_ITEMS } from './shell-nav.config';

describe('shell-nav.config', () => {
  it('includes Insumos and Operacoes in order', () => {
    const labels = SHELL_NAV_ITEMS.map((i) => i.label);
    expect(labels).toContain('Insumos');
    expect(labels).toContain('Operações');
    expect(labels.indexOf('Insumos')).toBeLessThan(labels.indexOf('Operações'));
  });

  it('has Insights with three child routes', () => {
    const insights = SHELL_NAV_ITEMS.find((i) => i.label === 'Insights');
    expect(insights?.children?.length).toBe(3);
    expect(insights?.children?.map((c) => c.route)).toEqual([
      '/insights/d1',
      '/insights/d2',
      '/insights/d3',
    ]);
  });
});
