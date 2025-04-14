import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TokenStoreService } from './token-store.service';

/**
 * Response containing new access and refresh tokens
 */
interface TokenResponse {
	/** The new JWT access token */
	accessToken: string;
	/** The new refresh token */
	refreshToken: string;
}

/**
 * Service handling authentication token management and renewal
 * Provides methods for token operations and authentication state
 */
@Injectable({
	providedIn: 'root',
})
export class AuthService {
	/** Tracks when a token refresh operation is in progress */
	private refreshInProgress = new BehaviorSubject<boolean>(false);

	/**
	 * Creates a new AuthService instance
	 * @param http - HttpClient for making API requests
	 * @param tokenStore - Service for storing tokens
	 */
	constructor(
		private http: HttpClient,
		private tokenStore: TokenStoreService
	) {}

	/**
	 * Gets the current access token
	 * @returns The access token or null if not available
	 */
	getAccessToken(): string | null {
		return this.tokenStore.getAccessToken();
	}

	/**
	 * Gets the current refresh token
	 * @returns The refresh token or null if not available
	 */
	getRefreshToken(): string | null {
		return this.tokenStore.getRefreshToken();
	}

	/**
	 * Stores new authentication tokens
	 * @param accessToken - The JWT access token
	 * @param refreshToken - The refresh token
	 */
	setTokens(accessToken: string, refreshToken: string): void {
		this.tokenStore.setTokens(accessToken, refreshToken);
	}

	/**
	 * Clears all stored tokens
	 * Used for logout or when authentication fails
	 */
	clearTokens(): void {
		this.tokenStore.clearTokens();
	}

	/**
	 * Attempts to refresh the access token using the refresh token
	 * Prevents multiple simultaneous refresh attempts
	 * @returns An Observable with new tokens or an error
	 */
	refreshToken(): Observable<TokenResponse> {
		const refreshToken = this.getRefreshToken();

		if (!refreshToken) {
			return throwError(() => new Error('No refresh token available'));
		}

		// If refresh already in progress, don't start another
		if (this.refreshInProgress.value) {
			return new Observable((observer) => {
				const subscription = this.refreshInProgress.subscribe(
					(inProgress) => {
						if (!inProgress) {
							observer.next({
								accessToken: this.getAccessToken() || '',
								refreshToken: this.getRefreshToken() || '',
							});
							observer.complete();
							subscription.unsubscribe();
						}
					}
				);
			});
		}

		this.refreshInProgress.next(true);

		return this.http
			.post<TokenResponse>(`${environment.refreshUrl}`, {
				refreshToken,
			})
			.pipe(
				tap((tokens) => {
					this.setTokens(tokens.accessToken, tokens.refreshToken);
					this.refreshInProgress.next(false);
				}),
				catchError((error) => {
					this.clearTokens();
					this.refreshInProgress.next(false);
					return throwError(() => error);
				})
			);
	}

	/**
	 * Checks if the user is currently authenticated
	 * @returns True if an access token is available, false otherwise
	 */
	isAuthenticated(): boolean {
		return !!this.getAccessToken();
	}
	/**
	 * Extracts the user ID from a JWT token
	 * @param token - The JWT token to decode
	 * @returns The user ID from the token or null if not found
	 */
	getUserIdFromToken(token: string): string {
		if (!token) {
			return '';
		}

		try {
			// Parse the JWT token (format: header.payload.signature)
			const tokenParts = token.split('.');
			if (tokenParts.length !== 3) {
				return '';
			}

			// Decode the payload (middle part)
			const payload = JSON.parse(atob(tokenParts[1]));

			// Extract user ID - check common claim names
			// Try standard claims first
			const userId =
				payload.sub || payload.nameid || payload.userId || payload.id;

			return userId || '';
		} catch (error) {
			console.error('Error decoding token:', error);
			return '';
		}
	}
}
