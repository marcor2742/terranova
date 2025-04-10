import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CommonModule } from '@angular/common';
import { Cocktail } from '../Classes/cocktail';

/**
 * Main home component of the application
 * Displays the home page with sidebar navigation and theme toggling
 */
@Component({
	selector: 'app-home',
	standalone: true,
	imports: [SearchbarComponent, RouterLink, CommonModule],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
	/**
	 * Signal controlling sidebar expanded state
	 */
	sidebarExpanded = signal<boolean>(true);

	selectedCocktails = signal<Cocktail[]>([]);
	showCocktailDetails = signal<boolean>(false);

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

	selectCocktail(Cocktail: Cocktail) {
		this.selectedCocktails.set([...this.selectedCocktails(), Cocktail]);
		if (this.selectedCocktails().length > 0) {
			this.showCocktailDetails.set(true);
		} else {
			this.showCocktailDetails.set(false);
		}
	}
	removeCocktail(id: number) {
		if (
			this.selectedCocktails().length > 0 &&
			this.selectedCocktails().find((c) => c.id === id)
		) {
			this.selectedCocktails.set(
				this.selectedCocktails().filter((c) => c.id !== id)
			);
		}
		if (this.selectedCocktails().length <= 0) {
			this.showCocktailDetails.set(false);
		}
	}
}
