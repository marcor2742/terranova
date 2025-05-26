import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, of, map } from 'rxjs';

import { isPlatformBrowser } from '@angular/common';
import { TokenStoreService } from './token-store.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { MeasureUnit } from '../Classes/cocktail';

export interface UserSettings {
	theme: string;
	language: string;
	notifications: boolean;
	searchPreference: string;
	locale?: MeasureUnit;
}

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	private defaultSettings: UserSettings = {
		theme: 'light',
		language: 'en',
		locale: 'metric',
		notifications: true,
		searchPreference: 'all',
	};

	private settingsSubject = new BehaviorSubject<UserSettings>(
		this.defaultSettings
	);
	public settings$ = this.settingsSubject.asObservable();

	// Store the current settings for synchronous access
	private currentSettings: UserSettings = { ...this.defaultSettings };
	private isBrowser: boolean;
	private platformId = inject(PLATFORM_ID);
	private token = inject(TokenStoreService);
	private http = inject(HttpClient);
	private translate = inject(TranslateService);
	constructor() {
		this.isBrowser = isPlatformBrowser(this.platformId);

		// Initialize with default settings first
		this.currentSettings = { ...this.defaultSettings };

		// Only try to load settings from localStorage if we're in a browser
		if (this.isBrowser) {
			// Load settings asynchronously to avoid blocking
			setTimeout(() => {
				this.loadSettings();
			}, 0);

			this.settings$.subscribe((settings) => {
				this.currentSettings = settings;
			});
		}
		this.getSetting('language').subscribe((language) => {
			if (language && this.isBrowser) {
				this.translate.use(language);
			}
		});
	}

	private loadSettings() {
		try {
			if (this.isBrowser && typeof localStorage !== 'undefined') {
				const savedSettings = localStorage.getItem('userSettings');
				if (savedSettings && savedSettings.length > 0) {
					try {
						const parsedSettings = JSON.parse(savedSettings);
						this.settingsSubject.next({
							...this.defaultSettings,
							...parsedSettings,
						});
					} catch (parseError) {
						console.error(
							'Error parsing settings JSON:',
							parseError
						);
					}
				}
			}
		} catch (e) {
			console.error('Error loading settings:', e);
		}
	}

	// Observable method (for reactive code)
	getSetting<K extends keyof UserSettings>(
		key: K
	): Observable<UserSettings[K]> {
		return this.settings$.pipe(map((settings) => settings[key]));
	}

	// Synchronous method (for pipes and other non-reactive code)
	getSettingValue<K extends keyof UserSettings>(key: K): UserSettings[K] {
		return this.currentSettings[key];
	}

	// Reactive methods
	getLanguage(): Observable<UserSettings['language']> {
		return this.getSetting('language');
	}

	getMeasurementSystem(): Observable<UserSettings['locale']> {
		return this.getSetting('locale');
	}

	// Synchronous methods
	getCurrentLanguage(): UserSettings['language'] {
		return this.getSettingValue('language');
	}

	getCurrentMeasurementSystem(): UserSettings['locale'] {
		return this.getSettingValue('locale');
	}

	updateSetting<K extends keyof UserSettings>(
		key: K,
		value: UserSettings[K]
	) {
		const currentSettings = this.settingsSubject.value;
		const updatedSettings = {
			...currentSettings,
			[key]: value,
		};

		// Update the settings
		this.settingsSubject.next(updatedSettings);

		// Save to localStorage only in browser context
		if (this.isBrowser && typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem(
					'userSettings',
					JSON.stringify(updatedSettings)
				);
			} catch (e) {
				console.error('Error saving settings to localStorage:', e);
			}
		}

		if (key === 'language' && this.isBrowser) {
			this.translate.use(value as string);
		}

		// Save to localStorage as before
		if (this.isBrowser && typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem(
					'userSettings',
					JSON.stringify(updatedSettings)
				);
			} catch (e) {
				console.error('Error saving settings to localStorage:', e);
			}
		}
	}

	logout() {
		// Rimuovi le impostazioni dal localStorage
		if (this.isBrowser && typeof localStorage !== 'undefined') {
			localStorage.removeItem('userSettings');
		}

		// Reimposta le impostazioni ai valori predefiniti
		this.settingsSubject.next(this.defaultSettings);
		this.currentSettings = { ...this.defaultSettings };

		// Invia la richiesta di logout al server
		return this.http.post(environment.logoutUrlextended, {}).pipe(
			tap(() => {
				// Invia una notifica di logout al token service
				this.token.logout();
			}),
			catchError((error) => {
				console.error('Errore durante il logout:', error);
				// Anche se la richiesta fallisce, procedi con il logout lato client
				this.token.logout();
				return of({ success: false, error: error });
			})
		);
	}
}
