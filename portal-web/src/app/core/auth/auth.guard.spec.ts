import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
    router = jasmine.createSpyObj<Router>('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('allows navigation when authenticated', () => {
    auth.isAuthenticated.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
    expect(result).toBe(true);
  });

  it('redirects to login when not authenticated', () => {
    auth.isAuthenticated.and.returnValue(false);
    const tree = {} as UrlTree;
    router.parseUrl.and.returnValue(tree);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(router.parseUrl).toHaveBeenCalledWith('/login');
    expect(result).toBe(tree);
  });
});
