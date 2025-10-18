import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  let clonedReq = req;

  
  if (token) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
  }

  // ✅ Only set Content-Type for non-FormData requests with body
  if (
    ['POST', 'PUT', 'PATCH'].includes(clonedReq.method.toUpperCase()) &&
    !(clonedReq.body instanceof FormData)
  ) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }

  return next(clonedReq);
};
