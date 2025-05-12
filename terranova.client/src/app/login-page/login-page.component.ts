import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
	Component,
	computed,
	effect,
	Inject,
	inject,
	OnInit,
	PLATFORM_ID,
	Resource,
	signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService, UserData } from '../services/login.service';
import { ConfirmationModalComponent } from '../shared/confirmation-modal/confirmation-modal.component';
import { ButtonComponent } from 'my-ui';
import { httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../services/jwthandler.service';
import { TranslateModule } from '@ngx-translate/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { FileManagementService } from '../services/file-management.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';

interface UploadFile extends File {
	objectURL?: string;
}

@Component({
	selector: 'app-login-page',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TranslateModule,
		StepperModule,
		ButtonModule,
		CheckboxModule,
		CalendarModule,
		InputTextModule,
		TextareaModule,
		DropdownModule,
		FileUploadModule,
		ProgressBarModule,
		BadgeModule,
	],
	templateUrl: './login-page.component.html',
	styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
	private formBuilder = inject(FormBuilder);
	private LoginService = inject(LoginService);
	private AuthService = inject(AuthService);
	private router = inject(Router);
	private fileManagementService = inject(FileManagementService);

	// Form signals
	username = signal<string>('');
	email = signal<string>('');

	// UI state signals
	emailError = signal<string>('');
	usernameError = signal<string>('');
	showEmailConfirmation = signal<boolean>(false);
	registerDiv = signal<boolean>(false);
	showStepper = signal<boolean>(false);
	activeStep = signal<number>(1);
	isLoading = signal<boolean>(false);
	isRegistering = signal<boolean>(false);

	loginForm = this.formBuilder.group({
		username: ['', [Validators.required, Validators.minLength(4)]],
		password: ['', Validators.required],
		email: ['', Validators.email],
	});

	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
		// Setup form value change listeners
		this.loginForm.get('username')?.valueChanges.subscribe((value) => {
			this.username.set(value || '');
		});

		this.loginForm.get('email')?.valueChanges.subscribe((value) => {
			this.email.set(value || '');
		});
		this.isPlatformBrowserValue = isPlatformBrowser(this.platformId);
	}

	showCalendar = signal<boolean>(false);

	ngOnInit(): void {
		if (isPlatformBrowser(this.platformId)) {
			// Delay calendar initialization to ensure DOM is ready
			setTimeout(() => {
				this.showCalendar.set(true);
			}, 0);
		}
	}

	isPlatformBrowserValue = false;
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

	// In login-page.component.ts

	register() {
		if (this.loginForm.valid) {
			this.isRegistering.set(true);
			const userData = {
				username: this.loginForm.get('username')?.value || '',
				password: this.loginForm.get('password')?.value || '',
				email: this.loginForm.get('email')?.value || '',
			};

			this.LoginService.register(userData).subscribe({
				next: (response) => {
					if (response.status === 200 || response.status === 201) {
						console.log(
							'Registrazione avvenuta con successo, ora effettuo il login'
						);
						// Dopo la registrazione riuscita, esegui il login automaticamente
						this.performLoginAfterRegistration(
							userData.username,
							userData.email,
							userData.password
						);
						// this.showStepper.set(true); debug
					}
				},
				error: (err) => {
					this.isRegistering.set(false);
					console.error('Registration failed:', err);
					// Gestione errori di registrazione
					if (err.error?.errors) {
						const errors = err.error.errors;
						if (errors.Username)
							this.usernameError.set(errors.Username[0]);
						if (errors.Email) this.emailError.set(errors.Email[0]);
					} else if (err.error?.DuplicateUserName) {
						this.usernameError.set(
							'This username is already taken'
						);
					} else if (err.error?.DuplicateEmail) {
						this.emailError.set('This email is already registered');
					} else {
						this.errorMessage.set(
							'Registration failed. Please try again.'
						);
					}
				},
			});
		} else {
			this.loginForm.markAllAsTouched();
		}
	}

	// metodo per effettuare login dopo registrazione
	performLoginAfterRegistration(
		username: string,
		email: string,
		password: string
	) {
		this.LoginService.login(email, username, password).subscribe({
			next: (response) => {
				this.isRegistering.set(false);
				if (response.status === 200) {
					const { token, refreshToken } = response.body!;
					this.AuthService.setTokens(token, refreshToken);
					const userId = this.AuthService.getUserIdFromToken(token);
					if (isPlatformBrowser(this.platformId)) {
						localStorage.setItem('userId', userId);
					}

					// Reset di eventuali errori
					this.emailError.set('');
					this.usernameError.set('');
					this.errorMessage.set('');

					// Messaggi di successo
					this.successMessage.set(
						'Registration completed successfully!'
					);

					// Mostra lo stepper
					this.showStepper.set(true);
				}
			},
			error: (err) => {
				this.isRegistering.set(false);
				console.error('Login dopo registrazione fallito:', err);
				this.errorMessage.set(
					'Registration successful but automatic login failed. Please login manually.'
				);
				this.showEmailConfirmation.set(false);
			},
		});
	}

	// Metodo per saltare gli stepper e andare direttamente alla home
	skipSetup() {
		this.router.navigate(['/home']);
	}

	// Metodo per finalizzare il processo
	finishSetup() {
		// Puoi aggiungere qui la logica per salvare eventuali informazioni finali
		this.router.navigate(['/home']);
	}

	login(): void {
		this.isLoading.set(true);
		const data = {
			username: this.loginForm.get('username')?.value || '',
			password: this.loginForm.get('password')?.value || '',
			email: this.loginForm.get('email')?.value || '',
		};

		if (!data.password || (!data.username && !data.email)) {
			console.error('Missing required fields');
			this.isLoading.set(false);
			this.errorMessage.set('Please provide username/email and password');
			return;
		}

		console.log('Attempting login with data:', data);
		this.LoginService.login(
			data.email,
			data.username,
			data.password
		).subscribe({
			next: (response) => {
				this.isLoading.set(false);
				console.log('HTTP status code:', response.status);

				if (response.status === 200) {
					const { token, refreshToken } = response.body!;
					this.AuthService.setTokens(token, refreshToken);
					const userId = this.AuthService.getUserIdFromToken(token);
					if (isPlatformBrowser(this.platformId)) {
						localStorage.setItem('userId', userId);
					}
					this.router.navigate(['/home']);
				} else {
					console.error('Login failed with status:', response.status);
					this.errorMessage.set('Login failed. Please try again.');
				}
			},
			error: (err) => {
				this.isLoading.set(false);
				console.error('Login failed with status:', err.status);

				// Gestione più specifica degli errori
				if (err.status === 401) {
					this.errorMessage.set('Invalid username or password');
				} else if (err.status === 403) {
					this.errorMessage.set(
						'Account locked. Please contact support.'
					);
				} else {
					this.errorMessage.set(
						err.error?.message || 'Login failed. Please try again.'
					);
				}
			},
		});
	}

	//post registration data

	// Profilo immagine
	profileImageUrl = signal<string>('');
	profileImageUploadUrl = environment.userImgUploadUrl; // URL endpoint per upload

	// Form profilo
	profileForm = this.formBuilder.group({
		fullName: [''],
		birthDate: [null],
		alcoholContentPreference: ['NoPreference'],
		language: ['English'],
		measurementSystem: ['Imperial'],
		glassPreference: [''],
		baseIngredientPreference: [''],
		bio: [''],
		showMyCocktails: [true],
	});

	// Opzioni per i dropdown
	alcoholOptions = [
		{ label: 'No Preference', value: 'NoPreference' },
		{ label: 'Alcoholic', value: 'Alcoholic' },
		{ label: 'Non-Alcoholic', value: 'NonAlcoholic' },
	];

	languageOptions = [
		{ label: 'English', value: 'en' },
		{ label: 'Italian', value: 'it' },
		{ label: 'French', value: 'fr' },
		{ label: 'German', value: 'de' },
		{ label: 'Spanish', value: 'es' },
	];

	measurementOptions = [
		{ label: 'Imperial (oz)', value: 'imperial' },
		{ label: 'Metric (ml)', value: 'metric' },
	];

	successMessage = signal<string>('');
	errorMessage = signal<string>('');

	// Metodi per gestire i vari step
	savePreferences() {
		if (this.profileForm.valid) {
			this.successMessage.set('');
			this.errorMessage.set('');
			// Convertiamo la data in DateOnly
			const birthDate = this.profileForm.get('birthDate')?.value;
			const formattedDate = birthDate ? this.formatDate(birthDate) : null;

			const profileData = {
				...this.profileForm.value,
				birthDate: formattedDate,
			} as UserData;

			// Chiamata API per salvare le preferenze
			this.LoginService.updateProfile(profileData).subscribe({
				next: (response) => {
					console.log('Profile updated successfully', response.body);
					this.successMessage.set('Profile updated successfully');
					// Vai al prossimo step
					this.activeStep.set(3);
				},
				error: (err) => {
					console.error('Error updating profile', err);
					this.errorMessage.set(
						'Error updating profile. Please try again.'
					);
					// Gestione degli errori di validazione
					if (err.error?.errors) {
						// Mostra gli errori specifici restituiti dal server
						const errorMessages = Array.isArray(err.error.errors)
							? err.error.errors.join(', ')
							: Object.values(err.error.errors).flat().join(', ');
						console.error('Validation errors:', errorMessages);
					} else if (err.error?.message) {
						console.error('Error message:', err.error.message);
					}

					// Permettiamo comunque di procedere al prossimo step in caso di errore
					this.activeStep.set(3);
				},
			});
		} else {
			// Marca tutti i campi come touched per mostrare gli errori
			this.profileForm.markAllAsTouched();
		}
	}

	// Formatta la data per l'API
	formatDate(date: Date | null): string {
		if (!date || !isPlatformBrowser(this.platformId)) return '';
		return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
	}

	filesToUpload: UploadFile[] = [];
	totalSize: number = 0;
	totalSizePercent: number = 0;

	onSelectFiles(event: any): void {
		if (!isPlatformBrowser(this.platformId) || !event) return;

		if (
			!event.currentFiles ||
			!Array.isArray(event.currentFiles) ||
			event.currentFiles.length === 0
		) {
			return;
		}

		// Solo il primo file
		const file = event.currentFiles[0];
		this.filesToUpload = [file];
		this.totalSize = file.size || 0;
		this.totalSizePercent = 0; // Reset progress
	}

	onRemoveTemplatingFile(
		file: any,
		removeFileCallback: Function,
		index: number
	): void {
		if (!isPlatformBrowser(this.platformId)) return;

		if (typeof removeFileCallback === 'function') {
			removeFileCallback(index);
		}

		this.filesToUpload = this.filesToUpload.filter((f, i) => i !== index);
		this.totalSize = 0;

		if (this.filesToUpload.length > 0) {
			this.filesToUpload.forEach((f) => {
				if (f && f.size) {
					this.totalSize += f.size;
				}
			});
		} else {
			this.totalSizePercent = 0;
		}
	}

	onClearTemplatingUpload(clearCallback: Function): void {
		if (!isPlatformBrowser(this.platformId)) return;

		if (typeof clearCallback === 'function') {
			clearCallback();
		}

		this.filesToUpload = [];
		this.totalSize = 0;
		this.totalSizePercent = 0;
	}

	initiateUpload(uploadCallback: Function): void {
		if (!isPlatformBrowser(this.platformId)) return;

		if (this.filesToUpload.length > 0) {
			const file = this.filesToUpload[0];

			// Usa FileManagementService per l'upload
			this.fileManagementService
				.uploadFile(file, this.profileImageUploadUrl)
				.subscribe({
					next: (response) => {
						if (response && response.url) {
							this.profileImageUrl.set(response.url);

							// Aggiorna il profilo utente con il nuovo URL dell'immagine
							const profileUpdateData: Partial<UserData> = {
								propicUrl: response.url,
							};

							this.LoginService.updateProfile(
								profileUpdateData as UserData
							).subscribe({
								next: () => {
									console.log(
										'Profile image updated successfully'
									);
									this.filesToUpload = [];
									this.totalSize = 0;
									this.totalSizePercent = 100;
								},
								error: (err) => {
									console.error(
										'Error updating profile with new image',
										err
									);
								},
							});
						}
					},
					error: (error) => {
						console.error('Error uploading file:', error);
						this.totalSizePercent = 0;
					},
				});
		}
	}

	onProgress(event: { progress: number }): void {
		if (!isPlatformBrowser(this.platformId)) return;
		this.totalSizePercent = event.progress;
	}

	choose(event: Event, callback: Function): void {
		if (typeof callback === 'function') {
			callback();
		}
	}

	formatSize(bytes: number): string {
		if (bytes === 0) return '0 B';

		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	// Sostituisci il metodo onProfileImageUpload esistente:
	onProfileImageUpload(event: any) {
		if (!isPlatformBrowser(this.platformId)) return;

		// Se non ci sono file selezionati, esci
		if (!event || !event.files || event.files.length === 0) {
			return;
		}

		const file = event.files[0];

		// Usa il servizio FileManagementService
		this.fileManagementService
			.uploadFile(file, this.profileImageUploadUrl)
			.subscribe({
				next: (response) => {
					if (response && response.url) {
						// Aggiorna l'URL dell'immagine profilo
						this.profileImageUrl.set(response.url);

						// Aggiorna anche il profilo utente con il nuovo URL dell'immagine
						const profileUpdateData: Partial<UserData> = {
							propicUrl: response.url,
						};

						// Chiamata API per aggiornare il profilo con l'URL dell'immagine
						this.LoginService.updateProfile(
							profileUpdateData as UserData
						).subscribe({
							next: (updateResponse) => {
								console.log(
									'Profile image URL updated successfully'
								);
							},
							error: (err) => {
								console.error(
									'Error updating profile with new image URL',
									err
								);
							},
						});
					} else if (response.error) {
						console.error('Upload error:', response.error);
					}
				},
				error: (error) => {
					this.onProfileImageUploadError(error);
				},
			});
	}

	onProfileImageUploadError(error: any) {
		console.error('Error uploading profile image:', error);
	}

	savePreferencesAndGoNext(activateCallback: Function) {
		this.savePreferences();
		if (typeof activateCallback === 'function') {
			activateCallback(3); // passa al prossimo step
		}
	}
}
