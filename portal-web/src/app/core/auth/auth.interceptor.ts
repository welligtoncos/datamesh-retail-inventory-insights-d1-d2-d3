import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const normalizedApiBase = environment.apiBaseUrl.replace(/\/$/, '');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(normalizedApiBase)) {
    return next(req);
  }

  const token = inject(AuthService).getAccessToken();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
