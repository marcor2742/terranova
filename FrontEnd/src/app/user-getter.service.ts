import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user';

/**
 * Response interface for user existence check
 * @property userExists - Indicates if a user with the given email/username exists
 */
interface UserExist {
	userExists: boolean;
}

/**
 * Simple respone for user infomation
 * @property user - the user returned by the response
 * @property errors - Optional errors if something goes wrong
 */
interface UserGetter {
	user: User;
	errors?: string;
}

/**
 * Response interface for partial user data requests
 * @property userData - Selected user fields
 * @property errors - Array of error messages if issues occur
 */
interface PartialUserResponse {
	userData: Partial<User>;
	errors?: string[];
}

@Injectable({
	providedIn: 'root',
})
/**
 * Service to handle user information
 * Checks with the Auth API for the user existance and info
 */
export class UserGetterService {
	private userInfoUrl: string = environment.userInfoUrl;
	private userCheckerUrl: string = environment.userCheckerUrl;
	constructor(private http: HttpClient) {}

	/**
	 * Check if a user with provided credentials exist
	 * @param email - Email to check if a corresponding user exists
	 * @param username - Username to check if a corresponding user exists
	 * @returns Observable<UserExist> - Observable that returns the user existence
	 */
	userExists(
		email: string | null,
		username: string | null
	): Observable<UserExist> {
		return new Observable<UserExist>((observer) => {
			observer.next({ userExists: false });
			observer.complete();
		});
		if (email) {
			return this.http.get<UserExist>(`${this.userCheckerUrl}/${email}`);
		} else if (username) {
			return this.http.get<UserExist>(
				`${this.userCheckerUrl}/${username}`
			);
		} else {
			return new Observable<UserExist>((observer) => {
				observer.next({ userExists: false });
				observer.complete();
			});
		}
	}

	userInfo(): Observable<UserGetter> {
		return this.http.get<UserGetter>(`${this.userInfoUrl}`);
	}

	/**
	 * Retrieves specific user fields to minimize payload size
	 * @param userId - ID of the user to retrieve
	 * @param fields - Array of field names to include in response
	 * @returns Observable containing requested user fields and possible error messages
	 */
	getUserPartial(
		userId: string,
		fields: string[]
	): Observable<PartialUserResponse> {
		const params = new HttpParams().set('fields', fields.join(','));
		return this.http.get<PartialUserResponse>(
			`${this.userInfoUrl}/${userId}`,
			{ params }
		);
	}

	/**
	 * Retrieves the username associated with the provided email
	 * @param email - Email of the user to retrieve the username for
	 * @returns Observable containing the username and possible error messages
	 */
	getUsernameByEmail(email: string): Observable<{ username: string; errors?: string[] }> {
		return new Observable<{username:string; errors?:string[]}>((observer) => {
			observer.next({ username : 'lollo' });
			observer.complete();
		});
		return this.http.get<{ username: string; errors?: string[] }>(
			`${this.userInfoUrl}/usernameByEmail/${email}`
		);
	}
}
