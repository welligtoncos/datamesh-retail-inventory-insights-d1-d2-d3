import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['getAccessToken']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('does not add Authorization for /health endpoint', () => {
    auth.getAccessToken.and.returnValue('test-token');
    const url = `${environment.apiBaseUrl}/health`;

    http.get(url).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush('ok');
  });

  it('adds Authorization header for API base URL when token exists', () => {
    auth.getAccessToken.and.returnValue('test-token');
    const url = `${environment.apiBaseUrl}/enriquecido/partitions`;

    http.get(url).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush({ partitions: [] });
  });

  it('does not add Authorization for external URLs', () => {
    auth.getAccessToken.and.returnValue('test-token');

    http.get('https://example.com/data').subscribe();

    const req = httpMock.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not add Authorization when token is missing', () => {
    auth.getAccessToken.and.returnValue(null);
    const url = `${environment.apiBaseUrl}/health`;

    http.get(url).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush('ok');
  });
});
