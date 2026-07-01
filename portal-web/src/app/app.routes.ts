import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { PlaceholderPageComponent } from './layout/placeholder-page/placeholder-page.component';
import { HomeDashboardComponent } from './features/home/home-dashboard.component';
import { InsumosListComponent } from './features/insumos/insumos-list.component';
import { OrigemPageComponent } from './features/origem/origem-page.component';
import { EnriquecidoPageComponent } from './features/enriquecido/enriquecido-page.component';
import { InsightsD1PageComponent } from './features/insights/d1/insights-d1-page.component';
import { InsightsD2PageComponent } from './features/insights/d2/insights-d2-page.component';
import { InsightsD3PageComponent } from './features/insights/d3/insights-d3-page.component';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeDashboardComponent },
      { path: 'insumos', component: InsumosListComponent },
      { path: 'origem', component: OrigemPageComponent },
      { path: 'enriquecido', component: EnriquecidoPageComponent },
      { path: 'insights/d1', component: InsightsD1PageComponent },
      { path: 'insights/d2', component: InsightsD2PageComponent },
      { path: 'insights/d3', component: InsightsD3PageComponent },
      { path: 'operacoes', component: PlaceholderPageComponent, data: { title: 'Operações' } },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
