import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { PlaceholderPageComponent } from './layout/placeholder-page/placeholder-page.component';
import { HomeDashboardComponent } from './features/home/home-dashboard.component';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeDashboardComponent },
      { path: 'insumos', component: PlaceholderPageComponent, data: { title: 'Insumos' } },
      { path: 'origem', component: PlaceholderPageComponent, data: { title: 'Origem' } },
      { path: 'enriquecido', component: PlaceholderPageComponent, data: { title: 'Enriquecido' } },
      { path: 'insights/d1', component: PlaceholderPageComponent, data: { title: 'Insight D-1 Comercial' } },
      { path: 'insights/d2', component: PlaceholderPageComponent, data: { title: 'Insight D-2 Ruptura' } },
      { path: 'insights/d3', component: PlaceholderPageComponent, data: { title: 'Insight D-3 Tendência' } },
      { path: 'operacoes', component: PlaceholderPageComponent, data: { title: 'Operações' } },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
