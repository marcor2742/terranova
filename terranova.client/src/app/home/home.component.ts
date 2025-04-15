import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CommonModule } from '@angular/common';
import { CocktailCardComponent } from '../cocktail-card/cocktail-card.component';
import { SettingsComponent } from '../settings/settings.component';
/**
 * Main home component of the application
 * Displays the home page with sidebar navigation and theme toggling
 */
@Component({
	selector: 'app-home',
	standalone: true,
	imports: [SearchbarComponent, CommonModule, CocktailCardComponent, SettingsComponent],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
	/**
	 * Signal controlling sidebar expanded state
	 */
	sidebarExpanded = signal<boolean>(true);

	selectedCocktails = signal<number[]>([]);
	showCocktailDetails = signal<boolean>(false);

	/**
	 * Current active view in the main content area
	 */
	activeView = signal<
		'home' | 'settings' | 'dashboard' | 'cocktails' | 'favorites'
	>('home');

	/**
	 * Theme service for managing application theme
	 */
	themeService = inject(ThemeService);

	/**
	 * Toggles the sidebar between expanded and collapsed states
	 */
	toggleSidebar() {
		this.sidebarExpanded.set(!this.sidebarExpanded());
	}

	/**
	 * Toggles between light and dark theme
	 */
	toggleTheme() {
		this.themeService.toggleTheme();
	}

	selectCocktail(id: number) {
		this.selectedCocktails.set([...this.selectedCocktails(), id]);
		if (this.selectedCocktails().length > 0) {
			this.showCocktailDetails.set(true);
		} else {
			this.showCocktailDetails.set(false);
		}
	}
	removeCocktail(id: number) {
		if (
			this.selectedCocktails().length > 0 &&
			this.selectedCocktails().find((c) => c === id)
		) {
			this.selectedCocktails.set(
				this.selectedCocktails().filter((c) => c !== id)
			);
		}
		if (this.selectedCocktails().length <= 0) {
			this.showCocktailDetails.set(false);
		}
	}

	/**
	 * Sets the active view in the content area
	 */
	setActiveView(
		view: 'home' | 'settings' | 'dashboard' | 'cocktails' | 'favorites'
	) {
		this.activeView.set(view);
	}
}
