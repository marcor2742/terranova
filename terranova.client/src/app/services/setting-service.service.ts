import {
	Inject,
	inject,
	Injectable,
	Optional,
	PLATFORM_ID,
} from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, of, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service'; // You'll need to add this dependency
import { isPlatformBrowser } from '@angular/common';

export interface UserSettings {
	theme: string;
	language: 'en' | 'fr' | 'es' | 'de' | 'it';
	notifications: boolean;
	searchPreference: 'original' | 'friend' | 'all';
	locale: 'imperial' | 'metric';
}

@Injectable({
	providedIn: 'root',
})
export class SettingsService {
	private defaultSettings: UserSettings = {
		theme: 'light',
		language: 'en',
		locale: 'imperial',
		notifications: true,
		searchPreference: 'all',
	};

	private settingsSubject = new BehaviorSubject<UserSettings>(
		this.defaultSettings
	);
	public settings$ = this.settingsSubject.asObservable();

	// Store the current settings for synchronous access
	private currentSettings: UserSettings = { ...this.defaultSettings };

	constructor(
		private cookieService: CookieService,
		@Inject(PLATFORM_ID) private platformId: Object
	) {
		// Only use cookie service in browser context
		if (isPlatformBrowser(this.platformId)) {
			this.loadSettings();

			// Keep our local copy updated whenever settings change
			this.settings$.subscribe((settings) => {
				this.currentSettings = settings;
			});
		} else {
			// For SSR, just use defaults
			this.currentSettings = this.defaultSettings;
		}
	}

	private loadSettings() {
		try {
			const savedSettings = this.cookieService.get('userSettings');
			if (savedSettings) {
				const parsedSettings = JSON.parse(savedSettings);
				this.settingsSubject.next({
					...this.defaultSettings,
					...parsedSettings,
				});
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

		// Save to cookies
		this.cookieService.set('userSettings', JSON.stringify(updatedSettings));
	}
}
