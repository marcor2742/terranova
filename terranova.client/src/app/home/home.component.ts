import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import {
	SearchbarComponent,
	SearchFilters,
} from '../searchbar/searchbar.component';
import { RouterLink, RouterModule } from '@angular/router';
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
import { Router, ActivatedRoute } from '@angular/router';
import { StateService } from '../services/state-service.service';

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
		ScrollerModule,
		DividerModule,
		SkeletonModule,
		ButtonModule,
		ToolbarModule,
		SelectButtonModule,
		TranslateModule,
		FiltersComponent,
		ReactiveFormsModule,
		RouterModule,
	],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class HomeComponent {
	private fb = inject(FormBuilder);
	private router = inject(Router);
	private stateService = inject(StateService);
	private route = inject(ActivatedRoute);
	themeService = inject(ThemeService);

	constructor() {
		this.stateService.selectedCocktails$.subscribe((cocktails) => {
			this.selectedCocktails.set(cocktails);
		});
		this.stateService.filters$.subscribe((filters) => {
			this.activeFilters.set(filters);
		});
		this.stateService.searchResults$.subscribe((results) => {
			this.selectedCocktails.set(results.map((cocktail) => cocktail.id));
		});
	}

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
		let updatedCocktails = [...this.selectedCocktails()];

		if (Searches.add === 'add') {
			if (!updatedCocktails.includes(Searches.id)) {
				updatedCocktails.push(Searches.id);
			}
		} else if (Searches.add === 'only') {
			updatedCocktails = [Searches.id];
		}

		this.selectedCocktails.set(updatedCocktails);
		this.stateService.updateSelectedCocktails(updatedCocktails);

		// Naviga solo se non sei già sulla pagina dei cocktail
		if (this.router.url !== '/home/cocktails') {
			this.router.navigate(['cocktails'], { relativeTo: this.route });
		}
	}

	handleFullSearch(event: {
		searchString: string;
		cocktails: any[];
		page: number;
	}) {
		if (!event.searchString || event.searchString.trim().length === 0) {
			console.warn('Empty search string, not navigating');
			return;
		}

		// Set UI state (from old implementation)
		this.currentSearchTerm.set(event.searchString);
		this.searchModeActive.set(true);
		this.sidebarExpanded.set(true);
		this.sidebarForm.get('sidebarMode')?.setValue('filters');
		this.activeView.set('search');
		this.searchMode.set('full');

		// Update filters with search term
		const updatedFilters = {
			...this.activeFilters(),
			SearchString: event.searchString,
			Page: event.page || 1,
		};

		// Update state
		this.activeFilters.set(updatedFilters);
		this.stateService.updateFilters(updatedFilters);

		// Process cocktail IDs and update selected cocktails
		if (event.cocktails && event.cocktails.length > 0) {
			const cocktailIds = event.cocktails.map((cocktail) => cocktail.id);
			this.selectedCocktails.set(cocktailIds);
			this.stateService.updateSelectedCocktails(cocktailIds);
		}

		// Update search results in state service
		this.stateService.updateSearchResults(event.cocktails);

		// Navigate using router
		this.router.navigate(['search', event.searchString], {
			relativeTo: this.route,
		});

		console.log(
			`Navigating to search with ${event.cocktails.length} results for "${event.searchString}"`
		);
	}
	closeCocktailDetails() {
		this.showCocktailDetails.set(false);
		this.selectedCocktails.set([]);
		this.activeView.set('home');
	}

	//handleFullSearch(filterSearch: bigSearch) {
	//	this.currentSearchTerm.set(filterSearch.searchString);
	//	this.searchModeActive.set(true);
	//	this.sidebarExpanded.set(true);
	//	this.sidebarForm.get('sidebarMode')?.setValue('filters');
	//	this.activeView.set('cocktails');
	//	this.searchMode.set('full');

	//	// Update activeFilters with the search term
	//	const updatedFilters = {
	//	  ...this.activeFilters(),
	//	  SearchString: filterSearch.searchString
	//	};
	//	this.activeFilters.set(updatedFilters);

	//	this.selectedCocktails.set(
	//	  filterSearch.cocktails.map((cocktail) => cocktail.id)
	//	);
	//  }
	pushFilters(filters: SearchFilters) {
		// Preserve the current search term when updating filters
		const currentSearchTerm = this.activeFilters().SearchString;

		const updatedFilters = {
			...filters,
			SearchString: currentSearchTerm || filters.SearchString,
		};

		// Update both local and state service
		this.activeFilters.set(updatedFilters);
		this.stateService.updateFilters(updatedFilters);
		this.searchMode.set('full');

		// If we have a search term, navigate to search route
		if (updatedFilters.SearchString) {
			this.router.navigate(['search', updatedFilters.SearchString], {
				relativeTo: this.route,
			});
		}
	}
	// pushFilters(filters: SearchFilters) {
	// 	// Preserve the current search term when updating filters
	// 	const currentSearchTerm = this.activeFilters().SearchString;

	// 	this.activeFilters.set({
	// 		...filters,
	// 		SearchString: currentSearchTerm || filters.SearchString,
	// 	});

	// 	this.searchMode.set('full');
	// }
}
