import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';

/**
 * Service for managing application themes
 * Handles theme switching, persistence, and state management
 */
@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	/** Local storage key for saving theme preference */
	private readonly THEME_KEY = 'selected-theme';
	/** Identifier for the dark theme */
	private readonly DARK_THEME = 'dark-theme';
	/** Identifier for the summer theme */
	private readonly SUMMER_THEME = 'summer-theme';

	/** Signal for the current theme */
	currentTheme = signal<string>(this.DARK_THEME);
	/** Tracks if the theme has been properly initialized */
	private initialized = false;

	/**
	 * Creates a new ThemeService instance
	 * @param platformId - Angular's platform identifier for SSR compatibility
	 */
	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
		// Load saved theme preference from localStorage
		if (isPlatformBrowser(this.platformId)) {
			this.loadSavedTheme();
		}
	}

	/**
	 * Loads the saved theme from local storage or uses default
	 */
	private loadSavedTheme(): void {
		const savedTheme =
			localStorage.getItem(this.THEME_KEY) || this.DARK_THEME;
		this.setTheme(savedTheme);
	}

	/**
	 * Sets the application theme
	 * @param theme - The theme identifier to apply
	 */
	setTheme(theme: string): void {
		// Update internal state
		this.currentTheme.set(theme);

		if (isPlatformBrowser(this.platformId)) {
			// Remove all theme classes
			document.body.classList.remove(this.DARK_THEME, this.SUMMER_THEME);

			// Add the selected theme class for the summer theme
			if (theme === this.SUMMER_THEME) {
				document.body.classList.add(this.SUMMER_THEME);
			}

			// Save theme preference in localStorage
			localStorage.setItem(this.THEME_KEY, theme);

			// Set initialized flag
			this.initialized = true;

			// Force a repaint to update CSS variables
			document.body.style.display = 'none';
			// This triggers a reflow
			void document.body.offsetHeight;
			document.body.style.display = '';
		}
	}

	/**
	 * Toggles between available themes
	 */
	toggleTheme(): void {
		const newTheme =
			this.currentTheme() === this.DARK_THEME
				? this.SUMMER_THEME
				: this.DARK_THEME;
		this.setTheme(newTheme);
	}

	/**
	 * Checks if the dark theme is currently active
	 * @returns True if the dark theme is active, false otherwise
	 */
	isDarkTheme(): boolean {
		return this.currentTheme() === this.DARK_THEME;
	}

	/**
	 * Checks if the theme system has been fully initialized
	 * @returns True if initialized, false otherwise
	 */
	isInitialized(): boolean {
		return this.initialized;
	}
}
