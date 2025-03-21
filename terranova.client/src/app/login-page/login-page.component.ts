import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	ValidationErrors,
	Validator,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { UserGetterService } from '../services/user-getter.service'
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { ButtonComponent } from 'my-ui';
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
	private userGetterService = inject(UserGetterService);
	private isRegistering: boolean = false;
	usernameExist: boolean = false;
	usernameChecked: string = '';
	emailExists: boolean = false;
	emailError: string = '';
	showEmailConfirmation: boolean = false;
	foundUsername: string = '';
	loginForm = this.formBuilder.group({
		username: ['', [Validators.required, Validators.minLength(4)]],
		password: ['', Validators.required],
		email: ['', Validators.email],
	});
	dataAvailable(): boolean {
		const usernameValue: string =
			this.loginForm.get('username')?.value || '';
		const passwordValue: string =
			this.loginForm.get('password')?.value || '';
		return !!(
			usernameValue &&
			passwordValue &&
			usernameValue.trim() !== '' &&
			passwordValue.trim() !== ''
		);
	}
	checkIfUserExist(): void {
		const username: string | null =
			this.loginForm.get('username')?.value || '';
		const email: string | null = this.loginForm.get('email')?.value || '';

		if (!username && !email && !this.loginForm.get('username')?.errors)
			return;
		this.userGetterService.userExists(email, username).subscribe({
			next: (response) => {
				if (username) {
					this.usernameChecked = username;
					this.usernameExist = response.userExists;
					if (!this.usernameExist) {
						this.isRegistering = true;
					}
				}
			},
		});
	}
	checkEmailExists(): void {
		const email = this.loginForm.get('email')?.value;

		if (email && !this.loginForm.get('email')?.errors) {
			this.userGetterService.userExists(email, null).subscribe({
				next: (response) => {
					this.emailExists = response.userExists;

					if (this.emailExists) {
						// Email exists, get the username but don't auto-fill
						this.userGetterService
							.getUsernameByEmail(email)
							.subscribe({
								next: (usernameResponse) => {
									if (usernameResponse.username) {
										// Show confirmation dialog instead of auto-filling
										this.foundUsername =
											usernameResponse.username;
										this.showEmailConfirmation = true;
										console.log('email already present');
									}
								},
								error: (error) => {
									console.error(
										'Error retrieving username:',
										error
									);
									this.emailError =
										'Error retrieving account information.';
								},
							});
					} else {
						// Email doesn't exist, which is fine for registration
						this.emailError = '';

					}
				},
				error: (error) => {
					console.error('Error checking email existence:', error);
					this.emailError = 'Error checking email.';
				},
			});
		}
	}

	/**
	 * Handle user confirming they are the account holder
	 */
	confirmEmailUser(): void {
		// Set the username from the found account
		this.loginForm.patchValue({
			username: this.foundUsername,
		});
		this.usernameChecked = this.foundUsername;
		this.usernameExist = true;

		// Hide the confirmation dialog
		this.showEmailConfirmation = false;

		// Focus on the password field
		setTimeout(() => {
			document.getElementById('password')?.focus();
		}, 100);
	}

	/**
	 * Handle user canceling the email confirmation
	 */
	cancelEmailConfirmation(): void {
		// Hide the confirmation dialog
		this.showEmailConfirmation = false;

		// Clear the email field
		this.loginForm.patchValue({
			email: '',
		});

		// Show error message
		this.emailError =
			'This email is already in use. Please use a different email.';

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
		return !this.usernameExist && this.usernameChecked !== '';
	  }
}
