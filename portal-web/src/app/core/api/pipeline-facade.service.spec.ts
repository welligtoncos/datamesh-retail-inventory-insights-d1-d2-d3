import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from '../auth/auth.service';
import { PipelineFacadeService } from './pipeline-facade.service';
import { environment } from '../../../environments/environment';

describe('PipelineFacadeService', () => {
  let service: PipelineFacadeService;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getIdentityClaims: () => ({ sub: 'test-sub', email: 'test@example.com' }),
          },
        },
      ],
    });
    service = TestBed.inject(PipelineFacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('falls back to mock executions list on 404', () => {
    service.loadExecutions(20).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.list.executions.length).toBeGreaterThan(0);
    });

    const req = http.expectOne(
      (r) => r.url === `${base}/pipeline/executions` && r.params.get('limit') === '20',
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('falls back to mock start on 404', () => {
    service.startProcessarDia('2022-01-02').subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.response.status).toBe('RUNNING');
      expect(result.response.dt).toBe('2022-01-02');
      expect(result.response.audit.sub).toBeTruthy();
    });

    const req = http.expectOne((r) => r.url === `${base}/pipeline/processar-dia`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ dt: '2022-01-02' });
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('falls back to mock get execution on 404', () => {
    service.startProcessarDia('2022-01-01').subscribe((start) => {
      const id = start.response.execution_id;
      service.getExecution(id).subscribe((result) => {
        expect(result.data_source).toBe('mock');
        expect(result.execution.execution_id).toBe(id);
      });

      const getReq = http.expectOne(
        (r) => r.url === `${base}/pipeline/executions/${encodeURIComponent(id)}`,
      );
      getReq.flush('not found', { status: 404, statusText: 'Not Found' });
    });

    const postReq = http.expectOne((r) => r.url === `${base}/pipeline/processar-dia`);
    postReq.flush('not found', { status: 404, statusText: 'Not Found' });
  });
});
