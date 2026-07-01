import { Component, input, output } from '@angular/core';
import { MatListModule } from '@angular/material/list';

import { AthenaTemplateDefinition } from '../../../core/api/models/athena.model';

@Component({
  selector: 'app-athena-template-list',
  standalone: true,
  imports: [MatListModule],
  template: `
    <nav aria-label="Templates Athena pré-aprovados">
      <mat-nav-list>
        @for (template of templates(); track template.template_id) {
          <a
            mat-list-item
            href="#"
            [class.selected]="template.template_id === selectedId()"
            (click)="onSelect($event, template.template_id)"
          >
            <span matListItemTitle>{{ template.title }}</span>
            <span matListItemLine>{{ template.description }}</span>
          </a>
        }
      </mat-nav-list>
    </nav>
  `,
  styles: `
    mat-nav-list {
      padding-top: 0;
    }
    .selected {
      background: rgba(25, 118, 210, 0.08);
    }
    a {
      text-decoration: none;
      color: inherit;
    }
  `,
})
export class AthenaTemplateListComponent {
  readonly templates = input.required<AthenaTemplateDefinition[]>();
  readonly selectedId = input<string | null>(null);
  readonly selectTemplate = output<string>();

  onSelect(event: Event, templateId: string): void {
    event.preventDefault();
    this.selectTemplate.emit(templateId);
  }
}
