import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PRIMARY_SFN_ALARM_NAME } from './models/ops-alarms.model';
import { OpsAlarmsFacadeService } from './ops-alarms-facade.service';
import { environment } from '../../../environments/environment';

describe('OpsAlarmsFacadeService', () => {
  let service: OpsAlarmsFacadeService;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(OpsAlarmsFacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('returns api data when GET /ops/alarms succeeds', () => {
    service.loadAlarms().subscribe((result) => {
      expect(result.data_source).toBe('api');
      expect(result.response.pipeline_operational).toBe(true);
      expect(result.response.alarms[0].alarm_name).toBe(PRIMARY_SFN_ALARM_NAME);
    });

    http.expectOne(`${base}/ops/alarms`).flush({
      alarms: [{ alarm_name: PRIMARY_SFN_ALARM_NAME, state: 'OK' }],
      pipeline_operational: true,
    });
  });

  it('falls back to mock OK on 404', () => {
    service.loadAlarms().subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.response.pipeline_operational).toBe(true);
      expect(result.response.alarms[0].state).toBe('OK');
    });

    http.expectOne(`${base}/ops/alarms`).flush('not found', {
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('mock demo forces ALARM state', () => {
    service.loadAlarms(true).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.response.alarms[0].state).toBe('ALARM');
      expect(result.response.pipeline_operational).toBe(false);
    });

    http.expectOne(`${base}/ops/alarms`).flush('not found', {
      status: 404,
      statusText: 'Not Found',
    });
  });
});
