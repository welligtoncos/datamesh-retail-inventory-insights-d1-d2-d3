import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-pipeline-dt-selector',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" class="dt-field">
      <mat-label>Dia a processar (dt)</mat-label>
      <mat-select
        [value]="selectedDt()"
        [disabled]="loading() || partitions().length === 0"
        (selectionChange)="onChange($event)"
        aria-label="Data do pipeline"
      >
        @for (dt of partitions(); track dt) {
          <mat-option [value]="dt">{{ dt }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: `
    .dt-field {
      min-width: 200px;
      flex: 0 1 240px;
    }
    @media (max-width: 599px) {
      .dt-field {
        width: 100%;
      }
    }
  `,
})
export class PipelineDtSelectorComponent {
  readonly partitions = input<string[]>([]);
  readonly selectedDt = input<string | null>(null);
  readonly loading = input(false);

  readonly dtChange = output<string>();

  onChange(event: MatSelectChange): void {
    if (event.value) {
      this.dtChange.emit(event.value);
    }
  }
}
