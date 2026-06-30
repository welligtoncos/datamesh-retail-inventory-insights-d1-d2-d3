import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { map } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { HealthBadgeComponent } from '../../shared/components/health-badge/health-badge.component';
import { SHELL_NAV_ITEMS, ShellNavItem } from './shell-nav.config';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    HealthBadgeComponent,
  ],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav
        #drawer
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="(isHandset$ | async) === false"
        class="shell-sidenav"
      >
        <div class="sidenav-header">Portal Datamesh</div>
        <mat-nav-list>
          @for (item of navItems; track item.route) {
            @if (item.children?.length) {
              <div mat-subheader>{{ item.label }}</div>
              @for (child of item.children; track child.route) {
                <a
                  mat-list-item
                  [routerLink]="child.route"
                  routerLinkActive="active"
                  (click)="closeDrawerIfHandset()"
                >
                  <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                  <span matListItemTitle>{{ child.label }}</span>
                </a>
              }
            } @else {
              <a
                mat-list-item
                [routerLink]="item.route"
                routerLinkActive="active"
                (click)="closeDrawerIfHandset()"
              >
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span matListItemTitle>{{ item.label }}</span>
              </a>
            }
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="shell-toolbar">
          @if (isHandset$ | async) {
            <button mat-icon-button type="button" aria-label="Menu" (click)="drawer.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="toolbar-title">W7 · Gestão do datamesh</span>
          <span class="spacer"></span>
          <app-health-badge />
          <span class="user-email">{{ email() }}</span>
          <button mat-button type="button" (click)="logout()">Sair</button>
        </mat-toolbar>

        <main class="shell-content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly drawer = viewChild<MatSidenav>('drawer');

  readonly navItems: ShellNavItem[] = SHELL_NAV_ITEMS;
  readonly email = signal(this.auth.getUserEmail() ?? 'usuário');

  readonly isHandset$ = this.breakpoint
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(map((r) => r.matches));

  logout(): void {
    this.auth.logout();
  }

  closeDrawerIfHandset(): void {
    if (this.breakpoint.isMatched(Breakpoints.Handset)) {
      this.drawer()?.close();
    }
  }
}
