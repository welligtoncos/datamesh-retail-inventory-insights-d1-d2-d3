import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-d1-date-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <div class="selector-row">
      <mat-form-field appearance="outline" class="dt-field">
        <mat-label>Dado D-1</mat-label>
        <mat-select
          [value]="selectedDt()"
          [disabled]="loading() || partitions().length === 0"
          (selectionChange)="onChange($event)"
          aria-label="Selecionar data do dado D-1"
        >
          @for (dt of partitions(); track dt) {
            <mat-option [value]="dt">{{ dt }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      @if (dataExecucao()) {
        <p class="exec-hint">Execução: {{ dataExecucao() }}</p>
      }
    </div>
  `,
  styles: `
    .selector-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      min-width: 0;
    }
    .dt-field {
      min-width: 180px;
      flex: 0 1 220px;
    }
    .exec-hint {
      margin: 0;
      color: rgba(0, 0, 0, 0.65);
      font-size: 0.95rem;
    }
    @media (max-width: 599px) {
      .selector-row {
        flex-direction: column;
        align-items: stretch;
      }
      .dt-field {
        width: 100%;
      }
    }
  `,
})
export class D1DateSelectorComponent {
  readonly partitions = input<string[]>([]);
  readonly selectedDt = input<string | null>(null);
  readonly dataExecucao = input<string | null>(null);
  readonly loading = input(false);

  readonly dtChange = output<string>();

  onChange(event: MatSelectChange): void {
    if (event.value) {
      this.dtChange.emit(event.value);
    }
  }
}
