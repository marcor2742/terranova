import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TokenStoreService } from '../services/token-store.service';
import { LoginPopupService } from '../services/login-popup.service';
import { isPlatformBrowser } from '@angular/common';

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
	const loginPopupService = inject(LoginPopupService);
	const platformId = inject(PLATFORM_ID);

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

	// Add the Authorization header if we have a token
	if (!isPlatformBrowser(platformId)) {
		return next(req);
	}

	return from(tokenStore.ensureValidAccessToken()).pipe(
		switchMap((token) => {
			if (token) {
				req = req.clone({
					setHeaders: {
						Authorization: `Bearer ${token}`,
					},
				});
				console.log('Token added to request:', token);
			}
			return next(req);
		}),
		catchError((error) => {
			console.error('Error during request:', error);

			// Only handle 401 Unauthorized errors
			if (error instanceof HttpErrorResponse && error.status === 401) {
				console.log('401 Unauthorized error detected');

				// Clear tokens and show login popup only for 401 errors
				tokenStore.clearTokens();

				if (isPlatformBrowser(platformId)) {
					loginPopupService.showLoginPopup();
					console.log('Showing login popup due to 401 error');
				}
			}

			// Always return the error regardless of status
			return throwError(() => error);
		})
	);
};
