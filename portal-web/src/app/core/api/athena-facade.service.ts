import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import { validateAthenaTemplateRequest } from './athena-template-params.util';
import { getAthenaTemplateById } from './athena-templates.catalog';
import { buildMockAthenaQueryResponse } from './data/athena-results-mock.data';
import { AthenaApiService } from './athena-api.service';
import { AthenaQueryParams, AthenaQueryResult } from './models/athena.model';

@Injectable({ providedIn: 'root' })
export class AthenaFacadeService {
  private readonly api = inject(AthenaApiService);

  runTemplate(templateId: string, params: AthenaQueryParams = {}): Observable<AthenaQueryResult> {
    if (!getAthenaTemplateById(templateId)) {
      return throwError(() => new Error('Template de consulta não encontrado.'));
    }

    const validation = validateAthenaTemplateRequest(templateId, params);
    if (!validation.valid) {
      return throwError(() => new Error(validation.errors.join(' ')));
    }

    const body = {
      template_id: templateId,
      params: validation.normalized,
    };

    return this.api.queryTemplate(body).pipe(
      map((response) => ({
        response,
        data_source: 'api' as const,
        loaded_at: new Date(),
      })),
      catchError(() =>
        of({
          response: buildMockAthenaQueryResponse(templateId, validation.normalized),
          data_source: 'mock' as const,
          loaded_at: new Date(),
        }),
      ),
    );
  }
}
