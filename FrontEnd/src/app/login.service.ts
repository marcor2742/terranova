import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user';

interface AuthResponse {
	user: User;
	token: string;
	error?: string;
}

@Injectable({
	providedIn: 'root',
})
export class LoginService {
	private loginUrl = environment.loginUrl;
	private registerUrl = environment.registerUrl;
	constructor(private http: HttpClient) {}

	login(email: string, password: string): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(`${this.loginUrl}`, {
			email,
			password,
		});
	}
	register(userData: Partial<User>): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(
			`${this.register}`,
			userData
		);
	}
}
