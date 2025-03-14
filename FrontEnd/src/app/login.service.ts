import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user';

/**
 * Represents the response received after an authentication attempt.
 * 
 * @interface AuthResponse
 * @property {User} user - The authenticated user details.
 * @property {string} token - The JWT token provided upon successful authentication.
 * @property {string} [error] - An optional error message if the authentication fails.
 */
interface AuthResponse {
	user: User;
	token: string;
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
	constructor(private http: HttpClient) {}

	/**
	 * Logs in a user with the provided email and password.
	 * 
	 * @param email - The email address of the user.
	 * @param password - The password of the user.
	 * @returns An observable of the authentication response.
	 */
	login(email: string, password: string): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(`${this.loginUrl}`, {
			email,
			password,
		});
	}

	/**
	 * Registers a new user with the provided user data.
	 * 
	 * @param userData - Partial user data containing at least email and password.
	 * @returns An observable of the authentication response.
	 */
	register(userData: Partial<User>): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(
			`${this.registerUrl}`,
			userData
		);
	}
}
