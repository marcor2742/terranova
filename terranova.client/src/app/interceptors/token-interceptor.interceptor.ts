import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { TokenStoreService } from '../services/token-store.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStoreService);
  const authUrls: string[] = [
    environment.loginUrl,
    environment.refreshUrl,
    environment.registerUrl,
  ];

  if (authUrls.some((url) => req.url.includes(url))) {
    return next(req);
  }

  // Get token from token store
  const token = tokenStore.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};