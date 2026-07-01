import { Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-origem-missing-dt-chip',
  standalone: true,
  imports: [MatChipsModule, MatIconModule, MatTooltipModule],
  template: `
    <mat-chip-set>
      <mat-chip disabled class="missing-dt" [matTooltip]="tooltip()">
        <mat-icon aria-hidden="true">block</mat-icon>
        {{ dt() }} — sem partição
      </mat-chip>
    </mat-chip-set>
  `,
  styles: `
    .missing-dt {
      color: #e65100;
      opacity: 0.9;
    }
    .missing-dt mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 0.25rem;
    }
  `,
})
export class OrigemMissingDtChipComponent {
  readonly dt = input.required<string>();

  tooltip(): string {
    return 'Nenhuma partição origem para esta data.';
  }
}
