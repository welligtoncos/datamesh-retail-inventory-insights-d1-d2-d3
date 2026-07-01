import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { ATHENA_DEFAULT_LIMIT } from '../../../core/api/athena-template-params.util';
import {
  AthenaQueryParams,
  AthenaTemplateDefinition,
} from '../../../core/api/models/athena.model';

@Component({
  selector: 'app-athena-template-run-form',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    @if (template(); as t) {
      <section class="run-form" aria-label="Parâmetros da consulta">
        <p class="hint">Consulta pré-aprovada — sem editor SQL.</p>

        @if (t.params_schema.dt) {
          <mat-form-field appearance="outline" class="field">
            <mat-label>{{ t.params_schema.dt.label }}</mat-label>
            <mat-select [(ngModel)]="dt" [disabled]="running()">
              @for (p of partitions(); track p) {
                <mat-option [value]="p">{{ p }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

        @if (t.params_schema.dts) {
          <mat-form-field appearance="outline" class="field">
            <mat-label>{{ t.params_schema.dts.label }}</mat-label>
            <mat-select [(ngModel)]="selectedDts" multiple [disabled]="running()">
              @for (p of partitions(); track p) {
                <mat-option [value]="p">{{ p }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }

        @if (t.params_schema.limit) {
          <mat-form-field appearance="outline" class="field limit">
            <mat-label>{{ t.params_schema.limit.label }}</mat-label>
            <input
              matInput
              type="number"
              min="1"
              [max]="t.params_schema.limit.max"
              [(ngModel)]="limit"
              [disabled]="running()"
            />
          </mat-form-field>
        }

        <button
          mat-flat-button
          color="primary"
          type="button"
          [disabled]="running() || !canRun()"
          (click)="onRun()"
        >
          Executar consulta
        </button>
      </section>
    }
  `,
  styles: `
    .run-form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .hint {
      flex: 1 1 100%;
      margin: 0;
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.65);
    }
    .field {
      min-width: 200px;
    }
    .limit {
      max-width: 120px;
    }
  `,
})
export class AthenaTemplateRunFormComponent {
  readonly template = input.required<AthenaTemplateDefinition | null>();
  readonly partitions = input<string[]>([]);
  readonly initialDt = input<string | null>(null);
  readonly initialDts = input<string[]>([]);
  readonly running = input(false);
  readonly run = output<AthenaQueryParams>();

  dt = '';
  selectedDts: string[] = [];
  limit = ATHENA_DEFAULT_LIMIT;

  constructor() {
    effect(() => {
      const t = this.template();
      const initial = this.initialDt();
      const parts = this.partitions();
      if (!t) {
        return;
      }
      if (t.params_schema.dt) {
        this.dt =
          initial && parts.includes(initial)
            ? initial
            : (parts[0] ?? '');
      }
      if (t.params_schema.dts) {
        const seed = this.initialDts().filter((d) => parts.includes(d));
        this.selectedDts =
          seed.length >= 2 ? seed : parts.slice(0, Math.min(2, parts.length));
      }
      if (t.params_schema.limit) {
        this.limit = t.params_schema.limit.default;
      }
    });
  }

  canRun(): boolean {
    const t = this.template();
    if (!t) {
      return false;
    }
    if (t.params_schema.dt && !this.dt) {
      return false;
    }
    if (t.params_schema.dts) {
      const min = t.params_schema.dts.min_items;
      return this.selectedDts.length >= min;
    }
    return true;
  }

  onRun(): void {
    const t = this.template();
    if (!t) {
      return;
    }
    const params: AthenaQueryParams = {};
    if (t.params_schema.dt) {
      params.dt = this.dt;
    }
    if (t.params_schema.dts) {
      params.dts = [...this.selectedDts];
    }
    if (t.params_schema.limit) {
      params.limit = this.limit;
    }
    this.run.emit(params);
  }
}
