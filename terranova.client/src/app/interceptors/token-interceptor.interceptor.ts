import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/jwthandler.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
	const authService = inject(AuthService);
	// Get token from in-memory signal (which falls back to localStorage on init)
	const token = authService.getAccessToken();

	if (token) {
		const clonedRequest = req.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});
		return next(clonedRequest);
	}

	return next(req);
};
