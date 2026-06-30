export interface ShellNavItem {
  label: string;
  route: string;
  icon: string;
  children?: ShellNavItem[];
}

export const SHELL_NAV_ITEMS: ShellNavItem[] = [
  { label: 'Início', route: '/home', icon: 'home' },
  { label: 'Insumos', route: '/insumos', icon: 'upload_file' },
  { label: 'Origem', route: '/origem', icon: 'calendar_month' },
  { label: 'Enriquecido', route: '/enriquecido', icon: 'analytics' },
  {
    label: 'Insights',
    route: '/insights/d1',
    icon: 'insights',
    children: [
      { label: 'D-1 Comercial', route: '/insights/d1', icon: 'leaderboard' },
      { label: 'D-2 Ruptura', route: '/insights/d2', icon: 'warning' },
      { label: 'D-3 Tendência', route: '/insights/d3', icon: 'trending_up' },
    ],
  },
  { label: 'Operações', route: '/operacoes', icon: 'settings' },
];
