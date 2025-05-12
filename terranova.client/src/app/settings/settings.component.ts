import { TranslateModule } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService, UserSettings } from '../services/setting-service.service';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';

@Component({
	selector: 'app-settings',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ButtonModule,
		InputSwitchModule,
		ToastModule,
		TranslateModule,
		DropdownModule,
	],
	templateUrl: './settings.component.html',
	styleUrl: './settings.component.scss',
	providers: [MessageService]
})
export class SettingsComponent implements OnInit {
	settingsForm: FormGroup;
	isSaving = false;

	languageOptions = [
		{ label: 'English', value: 'en' },
		{ label: 'Italian', value: 'it' }
	];

	searchPreferenceModes = [
		{ label: 'Only base cocktails', value: 'original' },
		{ label: 'Base cocktail and Friend cocktails', value: 'friend' },
		{ label: 'All cocktails', value: 'all' }
	];

	themeOptions = [
		{ label: 'Dark Theme', value: 'dark-theme' },
		{ label: 'Summer Theme', value: 'summer-theme' }
	];

	constructor(
		private fb: FormBuilder,
		private settingsService: SettingsService,
		private messageService: MessageService,
		private router: Router
	) {
		this.settingsForm = this.fb.group({
			theme: [''],
			language: [''],
			notifications: [true],
			searchPreference: ['']
		});
	}

	ngOnInit(): void {
		// Load settings into form
		this.settingsService.settings$.subscribe(settings => {
			this.settingsForm.patchValue(settings);
		});
	}

	onSubmit(): void {
		if (this.settingsForm.valid) {
			this.isSaving = true;

			const formValues = this.settingsForm.value;
			const updatePromises: Promise<any>[] = [];

			// Only update changed fields
			Object.keys(formValues).forEach(key => {
				const typedKey = key as keyof UserSettings;
				const currentValue = this.settingsService.getSettingValue(typedKey);

				if (currentValue !== formValues[typedKey]) {
					updatePromises.push(
						new Promise<void>((resolve) => {
							this.settingsService.updateSetting(typedKey, formValues[typedKey]);
							resolve();
						})
					);
				}
			});

			Promise.all(updatePromises)
				.then(() => {
					this.messageService.add({
						severity: 'success',
						summary: 'Settings Saved',
						detail: 'Your preferences have been updated.'
					});
				})
				.catch(error => {
					this.messageService.add({
						severity: 'error',
						summary: 'Save Failed',
						detail: 'Could not update settings. Please try again.'
					});
				})
				.finally(() => {
					this.isSaving = false;
				});
		}
	}

	onLogout(): void {
		this.settingsService.logout().subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Logout Success',
					detail: 'You have been successfully logged out'
				});

				// Redirect to login page after a short delay to show the message
				setTimeout(() => {
					this.router.navigate(['/login']);
				}, 1500);
			},
			error: (error) => {
				console.error('Logout error:', error);
				this.messageService.add({
					severity: 'error',
					summary: 'Logout Failed',
					detail: 'An error occurred during logout. Please try again.'
				});
			}
		});
	}
}
