import { HttpErrorResponse } from '@angular/common/http';

import { ApiErrorService } from './api-error.service';

describe('ApiErrorService', () => {
  let service: ApiErrorService;

  beforeEach(() => {
    service = new ApiErrorService();
  });

  const statuses = [0, 401, 403, 404, 500, 502, 503];

  statuses.forEach((status) => {
    it(`maps status ${status} to non-empty PT-BR message`, () => {
      const err = new HttpErrorResponse({ status, statusText: 'Test' });
      const mapped = service.mapHttpError(err);
      expect(mapped.message.length).toBeGreaterThan(0);
      expect(mapped.code).toBeTruthy();
    });
  });

  it('maps 401 to session message', () => {
    const mapped = service.mapHttpError(new HttpErrorResponse({ status: 401 }));
    expect(mapped.message).toContain('sessão');
  });
});
