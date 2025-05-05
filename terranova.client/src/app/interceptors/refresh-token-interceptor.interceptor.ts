import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/jwthandler.service';
import { LoginPopupService } from '../services/login-popup.service';
import { isPlatformBrowser } from '@angular/common';


export const refreshTokenInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
	const platformId = inject(PLATFORM_ID);

	const authUrls: string[] = [
		environment.loginUrl,
		environment.refreshUrl,
		environment.registerUrl,
	];

	if (authUrls.some((url) => req.url.includes(url))) {
		return next(req);
	}

	// No circular dependency here since we're not accessing tokens directly
	const authService = inject(AuthService);
	const loginPopupService = inject(LoginPopupService);


	if (!isPlatformBrowser(platformId)) {
		return next(req);
	}
	return next(req).pipe(

		catchError((error: HttpErrorResponse) => {
			// If the error is 401 Unauthorized, try to refresh the token
			if (error.status === 401) {
				return authService.refreshToken().pipe(
					switchMap(tokens => {
						// Retry the request with new token
						const authReq = req.clone({
							setHeaders: {
								Authorization: `Bearer ${tokens.accessToken}`
							}
						});
						return next(authReq);
					}),
					catchError(refreshError => {
						// If refresh fails, redirect to login
						authService.clearTokens();
						if (isPlatformBrowser(platformId)) {
							loginPopupService.showLoginPopup();
							console.log('showing popup from token interceptor');
						}

						return throwError(() => refreshError);
					})
				);
			}
			return throwError(() => error);
		})
	
	);
};
