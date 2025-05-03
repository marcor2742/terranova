import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import {
	bigSearch,
	SearchbarComponent,
	SearchFilters,
} from '../searchbar/searchbar.component';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from '../settings/settings.component';
import { Searchres } from '../searchresoult/searchresoult.component';
import { ScrollerModule } from 'primeng/scroller';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FiltersComponent } from '../filters/filters.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CocktailListComponent } from '../cocktail-list/cocktail-list.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { Cocktail } from '../Classes/cocktail';
/**
 * Main home component of the application
 * Displays the home page with sidebar navigation and theme toggling
 */
@Component({
	selector: 'app-home',
	standalone: true,
	imports: [
		SearchbarComponent,
		CommonModule,
		SettingsComponent,
		ScrollerModule,
		DividerModule,
		SkeletonModule,
		ButtonModule,
		ToolbarModule,
		SelectButtonModule,
		TranslateModule,
		FiltersComponent,
		ReactiveFormsModule,
		CocktailListComponent,
		DashboardComponent,
	],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
	private fb = inject(FormBuilder);

	sidebarForm = this.fb.group({
		sidebarMode: ['navigation'],
	});

	activeFilters = signal<SearchFilters>({
		SearchString: '',
		PageSize: 10,
		Page: 1,
		IsAlcoholic: 'NoPreference',
		GlassNames: [],
		Creators: [],
		Category: '',
		Ingredients: [],
		AllIngredients: 'false',
		ShowOnlyOriginal: 'false',
	});

	sidebarExpanded = signal<boolean>(true);

	selectedCocktails = signal<number[]>([]);
	showCocktailDetails = signal<boolean>(false);

	searchModeActive = signal<boolean>(false);
	currentSearchTerm = signal<string>('');
	listMode = signal<string>('list');
	searchMode = signal<string>('dropdown');
	/**
	 * Current active view in the main content area
	 */
	activeView = signal<
		'home' | 'settings' | 'dashboard' | 'cocktails' | 'favorites' | 'search'
	>('home');

	sidebarModeOptions = [
		{ label: 'Menu', value: 'navigation', icon: 'pi pi-bars' },
		{ label: 'Filters', value: 'filters', icon: 'pi pi-filter' },
	];

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
		view:
			| 'home'
			| 'settings'
			| 'dashboard'
			| 'cocktails'
			| 'favorites'
			| 'search'
	) {
		this.activeView.set(view);
	}

	modifySelectedCocktails(Searches: Searchres) {
		console.log('Cocktail selected:', Searches);
		if (Searches.add === 'add') {
			this.selectedCocktails.set([
				...this.selectedCocktails(),
				Searches.id,
			]);
			this.listMode.set('list');
		} else if (Searches.add === 'only') {
			this.selectedCocktails.set([Searches.id]);
			this.listMode.set('list');
		}
		if (this.selectedCocktails().length > 0) {
			this.showCocktailDetails.set(true);
			this.activeView.set('cocktails');
			this.listMode.set('list');
		} else {
			this.showCocktailDetails.set(false);
			this.listMode.set('list');
		}
	}
	closeCocktailDetails() {
		this.showCocktailDetails.set(false);
		this.selectedCocktails.set([]);
		this.activeView.set('home');
	}
	handleFullSearch(filterSearch: bigSearch) {
		this.currentSearchTerm.set(filterSearch.searchString);
		this.searchModeActive.set(true);
		this.sidebarExpanded.set(true);
		this.sidebarForm.get('sidebarMode')?.setValue('filters');
		this.activeView.set('cocktails');
		this.searchMode.set('full');
		
		// Update activeFilters with the search term
		const updatedFilters = {
		  ...this.activeFilters(),
		  SearchString: filterSearch.searchString
		};
		this.activeFilters.set(updatedFilters);
		
		this.selectedCocktails.set(
		  filterSearch.cocktails.map((cocktail) => cocktail.id)
		);
	  }

	  pushFilters(filters: SearchFilters) {
		// Preserve the current search term when updating filters
		const currentSearchTerm = this.activeFilters().SearchString;
		
		this.activeFilters.set({
		  ...filters,
		  SearchString: currentSearchTerm || filters.SearchString
		});
		
		this.searchMode.set('full');
	  }
}
