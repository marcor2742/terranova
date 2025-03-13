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
import { first } from 'rxjs';

export function EmailProviderValidator(
    email: string,
    provider: string
): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const emailControl = formGroup.get(email);
        const providerControl = formGroup.get(provider);

        if (!emailControl || !providerControl || emailControl.errors || providerControl.errors) {
            return null;
        }
        
        const emailString: string = emailControl.value || '';
        const emailProvider: string = providerControl.value || '';
        
        if (!emailProvider || !emailString) {
            return null;
        }
        
        // Check if email contains the provider
        if (emailString.includes(emailProvider)) {
            return null;
        }
        
        // Return validation error
        return { emailProviderMismatch: true };
    };
}

@Component({
	selector: 'app-login-page',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './login-page.component.html',
	styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
	private formBuilder = inject(FormBuilder);
	loginForm = this.formBuilder.group(
		{
			username: ['', [Validators.required, Validators.minLength(4)]],
			password: ['', Validators.required],
			email: this.formBuilder.group({
				provider: [''],
				emailString: ['', Validators.email],
			}),
		},
		{
			validators: EmailProviderValidator(
				'email.emailString',
				'email.provider'
			),
		}
	);

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
}
