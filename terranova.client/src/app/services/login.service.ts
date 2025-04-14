import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../Classes/user';

/**
 * Represents the response received after an authentication attempt.
 *
 * @interface AuthResponse
 * @property {string} userId - The unique identifier of the user.
 * @property {string} token - The JWT token provided upon successful authentication.
 * @property {string} refreshtoken - The refresh token provided upon successful authentication.
 * @property {string} [error] - An optional error message if the authentication fails.
 */
interface AuthResponse {
	statusCode: number;
	token: string;
	refreshToken: string;
	message?: string;
	exist?: boolean;
}

interface RegisterResponse {
	succeded: boolean;
	error?: string;
}

/**
 * Service responsible for handling user authentication and registration.
 *
 * @remarks
 * This service provides methods to log in and register users by making HTTP requests to the backend API.
 *
 * @example
 * ```typescript
 * constructor(private loginService: LoginService) {}
 *
 * this.loginService.login('user@example.com', 'password123').subscribe(response => {
 *   console.log(response);
 * });
 *
 * this.loginService.register({ email: 'newuser@example.com', password: 'password123' }).subscribe(response => {
 *   console.log(response);
 * });
 * ```
 */
@Injectable({
	providedIn: 'root',
})
export class LoginService {
	private loginUrl = environment.loginUrl;
	private registerUrl = environment.registerUrl;
	private http = inject(HttpClient);

	/**
	 * Logs in a user with the provided email or username and password.
	 *
	 * @param email - The email address of the user.
	 * @param password - The password of the user.
	 * @param username - The username of the user.
	 * @returns An observable of the authentication response.
	 */
	login(
		email: string | null,
		username: string | null,
		password: string
	): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(`${this.loginUrl}`, {
			email,
			username,
			password,
		});
	}

	/**
	 * Registers a new user with the provided user data.
	 *
	 * @param userData - Partial user data including email, password, and username.
	 * @returns An observable of the authentication response.
	 */
	register(userData: {
		email: string;
		password: string;
		username: string;
	}): Observable<RegisterResponse> {
		return this.http.post<RegisterResponse>(
			`${this.registerUrl}`,
			userData
		);
	}
}
