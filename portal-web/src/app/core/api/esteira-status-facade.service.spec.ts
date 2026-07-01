import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EsteiraStatusFacadeService } from './esteira-status-facade.service';
import { PRIMARY_SFN_ALARM_NAME } from './models/ops-alarms.model';
import { environment } from '../../../environments/environment';

describe('EsteiraStatusFacadeService', () => {
  let service: EsteiraStatusFacadeService;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EsteiraStatusFacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('combines health ok and mock alarms into operational', () => {
    service.loadStatus().subscribe((result) => {
      expect(result.status.level).toBe('operational');
      expect(result.data_source).toBe('mock');
      expect(result.status.console_alarm_url).toContain(PRIMARY_SFN_ALARM_NAME);
    });

    http.expectOne(`${base}/health`).flush('ok', { status: 200, statusText: 'OK' });
    http.expectOne(`${base}/ops/alarms`).flush('not found', {
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('shows api_offline when health fails', () => {
    service.loadStatus().subscribe((result) => {
      expect(result.status.level).toBe('api_offline');
    });

    http.expectOne(`${base}/health`).error(new ProgressEvent('error'));
    http.expectOne(`${base}/ops/alarms`).flush('not found', {
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('shows alarm when demo mock ALARM and health ok', () => {
    service.loadStatus({ demoAlarm: true }).subscribe((result) => {
      expect(result.status.level).toBe('alarm');
      expect(result.status.label).toBe('Esteira em alarme');
    });

    http.expectOne(`${base}/health`).flush('ok', { status: 200, statusText: 'OK' });
    http.expectOne(`${base}/ops/alarms`).flush('not found', {
      status: 404,
      statusText: 'Not Found',
    });
  });
});
