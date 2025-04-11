import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { TokenStoreService } from '../services/token-store.service';

/**
 * HTTP interceptor for adding authentication tokens to requests
 * Automatically adds the Bearer token to all non-auth endpoints
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next interceptor in the chain
 * @returns An observable of the HTTP event stream
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStoreService);
  
  // List of authentication URLs that don't require tokens
  const authUrls: string[] = [
    environment.loginUrl,
    environment.refreshUrl,
    environment.registerUrl,
  ];

  // Skip token addition for auth-related URLs
  if (authUrls.some((url) => req.url.includes(url))) {
    return next(req);
  }

  // Get token from token store
  const token = tokenStore.getAccessToken();

  // Add the Authorization header if we have a token
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};