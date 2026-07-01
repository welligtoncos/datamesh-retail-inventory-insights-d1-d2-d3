import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { D3_WINDOW_OPTIONS } from '../../../core/api/d3-trend.util';

@Component({
  selector: 'app-d3-window-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" class="window-field">
      <mat-label>Janela (dias)</mat-label>
      <mat-select
        [value]="selectedWindow()"
        [disabled]="loading()"
        (selectionChange)="onChange($event)"
        aria-label="Janela de dias para tendência D-3"
      >
        @for (days of windowOptions; track days) {
          <mat-option [value]="days">{{ days }} dias</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: `
    .window-field {
      min-width: 140px;
      flex: 0 1 160px;
    }
    @media (max-width: 599px) {
      .window-field {
        width: 100%;
      }
    }
  `,
})
export class D3WindowSelectorComponent {
  readonly windowOptions = [...D3_WINDOW_OPTIONS];
  readonly selectedWindow = input(7);
  readonly loading = input(false);

  readonly windowChange = output<number>();

  onChange(event: MatSelectChange): void {
    if (event.value != null) {
      this.windowChange.emit(Number(event.value));
    }
  }
}
