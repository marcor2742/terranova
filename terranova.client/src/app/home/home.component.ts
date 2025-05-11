import {
	Component,
	inject,
	signal,
	ViewEncapsulation,
	OnDestroy,
	PLATFORM_ID,
} from '@angular/core';
import {
	SearchbarComponent,
	SearchFilters,
} from '../searchbar/searchbar.component';
import { NavigationEnd, RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ScrollerModule } from 'primeng/scroller';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FiltersComponent } from '../filters/filters.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StateService } from '../services/state-service.service';
import { filter } from 'rxjs';
import { Subscription } from 'rxjs';
import { Searchres } from '../searchresoult/searchresoult.component';

// PrimeNG imports
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';

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
		SidebarModule,
		PanelMenuModule,
		TabMenuModule,
	],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
	encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnDestroy {
	private fb = inject(FormBuilder);
	private router = inject(Router);
	private stateService = inject(StateService);
	private route = inject(ActivatedRoute);
	themeService = inject(ThemeService);

	// Track all subscriptions
	private subscriptions = new Subscription();

	// Sidebar state
	sidebarVisible = signal<boolean>(true);
	menuItems: MenuItem[] = [];
	tabItems: MenuItem[] = [];
	activeTabItem: MenuItem | undefined;
	sidebarForm = this.fb.group({
		sidebarMode: ['navigation'],
	});

	// Application state
	activeFilters = signal<SearchFilters>({
		SearchString: '',
		PageSize: 10,
		Page: 1,
		IsAlcoholic: 'NoPreference',
		GlassNames: [],
		Creators: [],
		Categories: [],
		Ingredients: [],
		AllIngredients: 'false',
		ShowOnlyOriginal: 'false',
	});
	selectedCocktails = signal<number[]>([]);
	showCocktailDetails = signal<boolean>(false);
	searchModeActive = signal<boolean>(false);
	currentSearchTerm = signal<string>('');
	searchMode = signal<string>('dropdown');
	activeView = signal<
		| 'home'
		| 'settings'
		| 'dashboard'
		| 'cocktails'
		| 'favorites'
		| 'search'
		| 'create'
	>('home');

	constructor() {
		const platformId = inject(PLATFORM_ID);

		// Only execute client-side code when in browser environment
		if (isPlatformBrowser(platformId)) {
			// Get the initial URL
			const initialUrl = this.router.url;

			// Check if we're starting on a search route
			if (initialUrl.includes('/search/')) {
				const urlParts = initialUrl.split('/');
				const searchIndex = urlParts.indexOf('search');

				if (searchIndex >= 0 && searchIndex + 1 < urlParts.length) {
					const searchTerm = decodeURIComponent(
						urlParts[searchIndex + 1]
					);
					console.log(
						'Starting on direct search URL with term:',
						searchTerm
					);

					// Update search state
					this.currentSearchTerm.set(searchTerm);
					this.activeView.set('search');
					this.searchMode.set('full');
					this.setSidebarMode('filters');

					// Update filters with search term
					const updatedFilters = {
						...this.activeFilters(),
						SearchString: searchTerm,
						Page: 1,
					};

					this.activeFilters.set(updatedFilters);
					this.stateService.updateFilters(updatedFilters);

					// Explicitly trigger search after component initialization
					setTimeout(() => {
						console.log(
							'Triggering initial search from URL parameters'
						);
						this.stateService.performSearch(updatedFilters);
					}, 100);
				}
			}
		}

		// Existing subscription code
		this.subscriptions.add(
			this.stateService.selectedCocktails$.subscribe((cocktails) => {
				if (cocktails) this.selectedCocktails.set(cocktails);
			})
		);

		this.subscriptions.add(
			this.stateService.filters$.subscribe((filters) => {
				if (filters) this.activeFilters.set(filters);
			})
		);

		// Listen to route changes
		this.subscriptions.add(
			this.router.events
				.pipe(filter((event) => event instanceof NavigationEnd))
				.subscribe(() => {
					const urlSegments = this.router.url.split('/');
					const currentSegment = urlSegments[urlSegments.length - 1];

					if (currentSegment.includes('search')) {
						this.activeView.set('search');

						// Extract search term from URL if available
						const searchTermMatch =
							currentSegment.match(/search\/(.+)/);
						if (searchTermMatch && searchTermMatch[1]) {
							const decodedTerm = decodeURIComponent(
								searchTermMatch[1]
							);
							this.currentSearchTerm.set(decodedTerm);

							// Update sidebar mode to filters when on search page
							this.setSidebarMode('filters');

							// Make sure the search mode is set to full
							this.searchMode.set('full');

							// Update menu items to show the search entry
							this.initMenuItems();
						}
					} else if (
						[
							'dashboard',
							'settings',
							'cocktails',
							'favorites',
						].includes(currentSegment)
					) {
						this.activeView.set(currentSegment as any);
					}
				})
		);

		this.initMenuItems();
		this.initTabItems();
	}

	ngOnDestroy() {
		// Clean up all subscriptions
		this.subscriptions.unsubscribe();
	}

	/**
	 * Initialize panel menu items for sidebar navigation
	 */
	initMenuItems() {
		this.menuItems = [
			{
				label: 'Home',
				icon: 'pi pi-home',
				command: () => this.setActiveView('home'),
				expanded: this.activeView() === 'home',
			},
			{
				label: 'Dashboard',
				icon: 'pi pi-chart-bar',
				command: () => this.setActiveView('dashboard'),
				expanded: this.activeView() === 'dashboard',
			},
			// {
			// 	label: 'Favorites',
			// 	icon: 'pi pi-heart',
			// 	command: () => this.setActiveView('favorites'),
			// 	expanded: this.activeView() === 'favorites',
			// },
			{
				label: `Search: "${this.currentSearchTerm()}"`,
				icon: 'pi pi-search',
				command: () => this.goToSearch(),
				expanded: this.activeView() === 'search',
				visible: !!this.currentSearchTerm(),
			},
			{
				label: `Create`,
				icon: 'pi pi-plus',
				command: () => this.setActiveView('create'),
				expanded: this.activeView() === 'create',
			},
			{
				label: 'Settings',
				icon: 'pi pi-cog',
				command: () => this.setActiveView('settings'),
				expanded: this.activeView() === 'settings',
			},
		];
	}

	/**
	 * Initialize tab menu items for sidebar mode switching
	 */
	initTabItems() {
		this.tabItems = [
			{
				label: 'Menu',
				icon: 'pi pi-bars',
				command: () => this.setSidebarMode('navigation'),
			},
			{
				label: 'Filters',
				icon: 'pi pi-filter',
				command: () => this.setSidebarMode('filters'),
			},
		];
		this.activeTabItem = this.tabItems[0];
	}

	/**
	 * Set sidebar mode and update active tab
	 */
	setSidebarMode(mode: 'navigation' | 'filters') {
		this.sidebarForm.get('sidebarMode')?.setValue(mode);
		this.activeTabItem = this.tabItems.find(
			(item) =>
				(mode === 'navigation' && item.icon === 'pi pi-bars') ||
				(mode === 'filters' && item.icon === 'pi pi-filter')
		);
	}

	/**
	 * Toggles the sidebar between expanded and collapsed states
	 */
	toggleSidebar() {
		this.sidebarVisible.update((val) => !val);
	}

	/**
	 * Toggles between light and dark theme
	 */
	toggleTheme() {
		this.themeService.toggleTheme();
	}

	/**
	 * Sets the active view in the content area and navigates to it
	 */
	setActiveView(
		view:
			| 'home'
			| 'settings'
			| 'dashboard'
			| 'cocktails'
			| 'favorites'
			| 'search'
			| 'create'
	) {
		this.activeView.set(view);
		this.router.navigate([view], { relativeTo: this.route });
	}

	/**
	 * Adds or replaces cocktails in the selection and navigates to cocktail list
	 */
	modifySelectedCocktails(search: Searchres) {
		let updatedCocktails = [...this.selectedCocktails()];

		if (search.add === 'add') {
			if (!updatedCocktails.includes(search.id)) {
				updatedCocktails.push(search.id);
			}
		} else if (search.add === 'only') {
			updatedCocktails = [search.id];
		}

		this.selectedCocktails.set(updatedCocktails);
		this.stateService.updateSelectedCocktails(updatedCocktails);

		// Crea il parametro di percorso per l'URL
		const cocktailIds = updatedCocktails.join(',');

		// Controlla se siamo già nella pagina dei cocktail
		if (this.router.url.includes('/home/cocktails')) {
			// Aggiorna solo lo stato senza navigare, aggiornare anche i parametri dell'URL
			this.router.navigate(['cocktails', cocktailIds], {
				relativeTo: this.route,
				replaceUrl: true // Sostituisce invece di aggiungere alla cronologia
			});
		} else {
			// Se non siamo già nella pagina cocktails, naviga a cocktails con ID
			this.router.navigate(['cocktails', cocktailIds], { relativeTo: this.route });
		}
	}


	/**
	 * Close cocktail details and reset selection
	 */
	closeCocktailDetails() {
		this.showCocktailDetails.set(false);
		this.selectedCocktails.set([]);
		this.activeView.set('home');
	}

	/**
	 * Navigate to search results with current search term
	 */
	goToSearch() {
		if (this.currentSearchTerm()) {
			this.activeView.set('search');
			this.router.navigate(['search', this.currentSearchTerm()], {
				relativeTo: this.route,
			});
		}
	}

	/**
	 * Update filters while preserving search term and navigate if needed
	 */
	pushFilters(filters: SearchFilters) {
		const currentSearchTerm = this.activeFilters().SearchString;

		// Create a merged filter object that includes current filters plus new ones
		const updatedFilters = {
			...this.activeFilters(), // Start with ALL current filters
			...filters, // Apply new filters on top
			SearchString: currentSearchTerm || filters.SearchString,
		};

		// Update state
		this.activeFilters.set(updatedFilters);
		this.stateService.updateFilters(updatedFilters);
		this.searchMode.set('full');

		if (updatedFilters.SearchString) {
			// Get current query params and merge with new ones
			const queryParams: any = {};

			// Build query params (leave this part unchanged)
			// Add filter parameters to queryParams
			if (updatedFilters.IsAlcoholic !== 'NoPreference') {
				queryParams.alc = updatedFilters.IsAlcoholic;
			}
			if (updatedFilters.GlassNames?.length > 0) {
				queryParams.glasses = updatedFilters.GlassNames.join(',');
			}
			if (updatedFilters.Ingredients?.length > 0) {
				queryParams.ing = updatedFilters.Ingredients.join(',');
			}
			if (updatedFilters.Categories?.length > 0) {
				queryParams.cat = updatedFilters.Categories.map(
					(c) => c.name
				).join(',');
			}
			if (updatedFilters.AllIngredients === 'true') {
				queryParams.allIng = 'true';
			}
			if (updatedFilters.ShowOnlyOriginal === 'true') {
				queryParams.orig = 'true';
			}

			// Add page and pageSize to queryParams if they differ from defaults
			if (updatedFilters.Page !== 1) {
				queryParams.page = updatedFilters.Page;
			}
			if (updatedFilters.PageSize !== 10) {
				queryParams.size = updatedFilters.PageSize;
			}

			// Even if no search term, we need to navigate to update URL with filter params
			const routePath = updatedFilters.SearchString
				? ['search', updatedFilters.SearchString]
				: ['search'];

			this.router.navigate(routePath, {
				relativeTo: this.route,
				queryParams,
				queryParamsHandling: 'merge',
			});

			// Instead of triggering search in cocktail-list, use the centralized method
			this.stateService.performSearch(updatedFilters);
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

		console.log(
			`HomeComponent: Navigating to search with term "${event.searchString}"`
		);

		// Update UI state
		this.currentSearchTerm.set(event.searchString);
		this.searchModeActive.set(true);
		this.sidebarForm.get('sidebarMode')?.setValue('filters');
		this.activeView.set('search');
		this.searchMode.set('full');

		// Update filters
		const updatedFilters = {
			...this.activeFilters(),
			SearchString: event.searchString,
			Page: event.page || 1,
		};
		this.activeFilters.set(updatedFilters);
		this.stateService.updateFilters(updatedFilters);

		// Update search results if provided
		if (event.cocktails && event.cocktails.length > 0) {
			const cocktailIds = event.cocktails.map((cocktail) => cocktail.id);
			this.selectedCocktails.set(cocktailIds);
			this.stateService.updateSelectedCocktails(cocktailIds);
			this.stateService.updateSearchResults(event.cocktails);
		}

		this.router
			.navigate(['search', event.searchString], {
				relativeTo: this.route,
			})
			.then(() => {
				console.log(
					`Navigation sto cazto search/${event.searchString} completed`
				);
			})
			.catch((err) => {
				console.error('Navigation failed:', err);
			});
	}
}
