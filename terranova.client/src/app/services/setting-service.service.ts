import {
	Inject,
	Injectable,
	PLATFORM_ID,
} from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, of, map } from 'rxjs';

import { isPlatformBrowser } from '@angular/common';

export interface UserSettings {
	theme: string;
	language: string;
	notifications: boolean;
	searchPreference: string;
	locale?: string;
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
	private isBrowser: boolean;

	constructor(
		@Inject(PLATFORM_ID) private platformId: Object
	) {
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
						console.error('Error parsing settings JSON:', parseError);
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
				localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
			} catch (e) {
				console.error('Error saving settings to localStorage:', e);
			}
		}
	}
}
