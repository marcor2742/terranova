import { CommonModule } from '@angular/common';
import {
	Component,
	computed,
	effect,
	inject,
	Resource,
	signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { ButtonComponent } from 'my-ui';
import { httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../services/jwthandler.service';
/**
 * Response interface for user existence check
 * @property userExists - Indicates if a user with the given email/username exists
 */
type UserExistsResponse = {
	userExists: boolean;
};

interface UsernameResponse {
	username: string;
	errors?: string;
}

@Component({
	selector: 'app-login-page',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ConfirmationModalComponent,
		ButtonComponent,
	],
	templateUrl: './login-page.component.html',
	styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
	private formBuilder = inject(FormBuilder);
	private LoginService = inject(LoginService);
	private loginEndpointUrl = environment.loginUrl;
	private userInfoUrl = environment.userInfoUrl;
	private AuthService = inject(AuthService);
	private router = inject(Router);
	// Form signals
	username = signal<string>('');
	email = signal<string>('');

	// UI state signals
	usernameChecked = signal<string>('');
	emailError = signal<string>('');
	showEmailConfirmation = signal<boolean>(false);
	foundUsername = signal<string>('');

	// Create resources that react to the input signals
	userExistsResource: Resource<UserExistsResponse> =
		httpResource<UserExistsResponse>(
			() => ({
				url: `${this.loginEndpointUrl}`,
				method: 'POST',
				body: { username: this.username() },
			}),
			{ defaultValue: { userExists: false } }
		);
	// computed(() => {
	// 	const currentUsername = this.username();
	// 	if (currentUsername && currentUsername.length >= 4) {
	// 		return httpResource<UserExistsResponse>({
	// 			url: `${this.userExistUrl}`,
	// 			params: { username: currentUsername },
	// 		});
	// 	}
	// 	return null;
	// });

	emailExistsResource: Resource<UserExistsResponse> =
		httpResource<UserExistsResponse>(
			() => ({
				url: `${this.loginEndpointUrl}`,
				method: 'POST',
				body: { email: this.email() },
			}),
			{ defaultValue: { userExists: false } }
		);
	//  = computed(() => {
	// 	const currentEmail = this.email();
	// 	if (currentEmail && this.isValidEmail(currentEmail)) {
	// 		return httpResource<UserExistsResponse>({
	// 			url: `${this.userExistUrl}`,
	// 			params: { email: currentEmail },
	// 		});
	// 	}
	// 	return null;
	// });

	usernameByEmailResource = httpResource<UsernameResponse>(
		() => ({
			url: `${this.loginEndpointUrl}`,
			method: 'POST',
			body: { email: this.email() },
		}),
		{ defaultValue: { username: '', errors: '' } }
	);
	// computed(() => {
	// 	const currentEmail = this.email();
	// 	const emailResource = this.emailExistsResource();

	// 	if (emailResource?.value()?.userExists) {
	// 		return httpResource<UsernameResponse>({
	// 			url: `${this.userInfoUrl}`,
	// 			params: { email: currentEmail },
	// 		});
	// 	}
	// 	return null;
	// });

	// Derived state
	// usernameExist = computed(() => {
	// 	const resource = this.userExistsResource;
	// 	return resource?.value()?.userExists || false;
	// });

	// emailExists = computed(() => {
	// 	const resource = this.emailExistsResource();
	// 	return resource?.value()?.userExists || false;
	// });

	isRegistering = computed(() => {
		return (
			!this.userExistsResource.value() && this.usernameChecked() !== ''
		);
	});

	loginForm = this.formBuilder.group({
		username: ['', [Validators.required, Validators.minLength(4)]],
		password: ['', Validators.required],
		email: ['', Validators.email],
	});

	constructor() {
		// Setup form value change listeners
		this.loginForm.get('username')?.valueChanges.subscribe((value) => {
			this.username.set(value || '');
		});

		this.loginForm.get('email')?.valueChanges.subscribe((value) => {
			this.email.set(value || '');
		});
	}

	isValidEmail(email: string): boolean {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	dataAvailable(): boolean {
		const usernameValue = this.username();
		const passwordValue = this.loginForm.get('password')?.value || '';
		return !!(
			usernameValue &&
			passwordValue &&
			usernameValue.trim() !== '' &&
			passwordValue.trim() !== ''
		);
	}

	confirmEmailUser(): void {
		// Set the username from the found account
		this.loginForm.patchValue({
			username: this.foundUsername(),
		});

		// Hide the confirmation dialog
		this.showEmailConfirmation.set(false);

		// Focus on the password field
		setTimeout(() => {
			document.getElementById('password')?.focus();
		}, 100);
	}

	cancelEmailConfirmation(): void {
		// Hide the confirmation dialog
		this.showEmailConfirmation.set(false);

		// Clear the email field
		this.loginForm.patchValue({
			email: '',
		});

		// Show error message
		this.emailError.set(
			'This email is already in use. Please use a different email.'
		);

		// Focus back on the email field
		setTimeout(() => {
			document.getElementById('email')?.focus();
		}, 100);
	}

	UpdateData(): void {
		if (this.loginForm.valid) {
			console.log('Form data:', this.loginForm.value);
			// You could do your real update logic here
		} else {
			console.log('Form is invalid');
			// Mark all fields as touched to display validation errors
			this.loginForm.markAllAsTouched();
		}
	}

	registerDiv(): boolean {
		return this.isRegistering();
	}

	register(): void {
		const userData = {
			username: this.loginForm.get('username')?.value || '',
			password: this.loginForm.get('password')?.value || '',
			email: this.loginForm.get('email')?.value || '',
		};
		if (!userData.email || !userData.username || !userData.password) {
			console.error('Missing required fields');
			return;
		}
		this.LoginService.register(userData).subscribe((response) => {
			if (response.succeded) {
				this.login();
			} else {
				console.error('Registration failed:', response.error);
			}
		});
	}
	login(): void {
		const data = {
			username: this.loginForm.get('username')?.value || '',
			password: this.loginForm.get('password')?.value || '',
			email: this.loginForm.get('email')?.value || '',
		};
		if (!data.password || (!data.username && !data.email)) {
			console.error('Missing required fields');
			return;
		}
		this.LoginService.login(
			data.email,
			data.username,
			data.password
		).subscribe({
			next: (response) => {
				if (response) {
					const { token, refreshToken } = response;
					this.AuthService.setTokens(token, refreshToken);
					const userId = response.userId;
					localStorage.setItem('userId', userId);
					this.router.navigate(['/home']);
				}
			},
		});
	}
}
