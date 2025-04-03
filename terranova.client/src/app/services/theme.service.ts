import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	private readonly THEME_KEY = 'selected-theme';
	private readonly DARK_THEME = 'dark-theme';
	private readonly SUMMER_THEME = 'summer-theme';

	// Observable for theme changes
	currentTheme = signal<string>(this.DARK_THEME);
	private initialized = false;

	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
		// Load saved theme preference from localStorage
		if (isPlatformBrowser(this.platformId)) {
			this.loadSavedTheme();
		}
	}

	private loadSavedTheme(): void {
		const savedTheme =
			localStorage.getItem(this.THEME_KEY) || this.DARK_THEME;
		this.setTheme(savedTheme);
	}

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

	toggleTheme(): void {
		const newTheme =
			this.currentTheme() === this.DARK_THEME
				? this.SUMMER_THEME
				: this.DARK_THEME;
		this.setTheme(newTheme);
	}

	isDarkTheme(): boolean {
		return this.currentTheme() === this.DARK_THEME;
	}

	isInitialized(): boolean {
		return this.initialized;
	}
}
