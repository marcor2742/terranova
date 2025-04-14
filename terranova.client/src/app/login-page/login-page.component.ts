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
import { TranslateModule } from '@ngx-translate/core';


@Component({
	selector: 'app-login-page',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ButtonComponent,
		TranslateModule,
	],
	templateUrl: './login-page.component.html',
	styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
	private formBuilder = inject(FormBuilder);
	private LoginService = inject(LoginService);
	private AuthService = inject(AuthService);
	private router = inject(Router);
	
	// Form signals
	username = signal<string>('');
	email = signal<string>('');

	// UI state signals
	emailError = signal<string>('');
	usernameError = signal<string>('');
	showEmailConfirmation = signal<boolean>(false);
	registerDiv = signal<boolean>(false);


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

	register(): void {
		if (this.showEmailConfirmation() === false) {
			this.showEmailConfirmation.set(true);
			return;
		}
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
				console.error('Registration failed:', response.error); // Handle error
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
		console.log('Attempting login with data:', data);
		this.LoginService.login(
			data.email,
			data.username,
			data.password
		).subscribe({
			next: (response) => {
				console.log('Login response:', response);
				if (response) {
					const { token, refreshToken } = response;
					console.log('Tokens received:', { token, refreshToken });
					this.AuthService.setTokens(token, refreshToken);
					const userId = this.AuthService.getUserIdFromToken(token);
					console.log('Extracted userId:', userId);
					localStorage.setItem('userId', userId);
					this.router.navigate(['/home']);
				}
			},
			error: (err) => {
				console.error('Login error:', err);
			},
		});
	}
}
