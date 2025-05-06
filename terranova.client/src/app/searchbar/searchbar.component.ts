import {
	Component,
	input,
	output,
	Resource,
	signal,
	OnInit,
	Inject,
	PLATFORM_ID,
	computed,
	Signal,
	effect,
} from '@angular/core';
import { environment } from '../../environments/environment';
import {
	Searchres,
	SearchresoultComponent,
} from '../searchresoult/searchresoult.component';
import { CockResoults, Cocktail, Ingredient } from '../Classes/cocktail';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpParams, httpResource } from '@angular/common/http';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SidebarModule } from 'primeng/sidebar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import {
	Subject,
	debounceTime,
	distinctUntilChanged,
	filter,
	takeUntil,
} from 'rxjs';
import { Category } from '../services/categories.service';

export interface bigSearch {
	cocktails: Cocktail[];
	searchString: string;
	page: number;
}

export interface SearchFilters {
	SearchString: string;
	PageSize: number;
	Page: number;
	IsAlcoholic: 'Alcoholic' | 'NonAlcoholic' | 'NoPreference';
	GlassNames: string[];
	Creators: string[];
	Categories: Category[];
	Ingredients: string[];
	AllIngredients: 'true' | 'false';
	ShowOnlyOriginal: 'true' | 'false';
}

/**
 * Component for searching cocktails
 * Provides search functionality and displays results
 */
@Component({
	selector: 'app-searchbar',
	imports: [
		SearchresoultComponent,
		MatDividerModule,
		CommonModule,
		ReactiveFormsModule,
		TranslateModule,
		// PrimeNG modules
		ButtonModule,
		InputTextModule,
		CardModule,
		DividerModule,
		SidebarModule,
		SelectButtonModule,
		MultiSelectModule,
		SkeletonModule,
	],
	templateUrl: './searchbar.component.html',
	styleUrl: './searchbar.component.scss',
})
export class SearchbarComponent implements OnInit {
	/** Current search parameters */
	searchParams = signal<string>('');

	currentPage = signal<number>(1);
	hasMoreResults = signal<boolean>(true);

	/** Size of the result display */
	ResoultSize = input<CockResoults>('small');

	/** Maximum number of results to display */
	MaxResoults = input<number>(5);

	searchMode = input<string>('dropdown');

	readonly cocktailSelected = output<Searchres>();

	readonly continuedSearch = output<bigSearch>();

	filters = input<SearchFilters>({
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

	searchForm: FormGroup;
	searchUrl = '';

	private readonly DEBOUNCE_TIME_MS = 300;

	/** Minimum characters to trigger search */
	private readonly MIN_SEARCH_LENGTH = 1;

	/** Tracks component lifecycle for unsubscribing */
	private destroy$ = new Subject<void>();

	/** Tracks search count for debugging */
	private searchCount = 0;
	private lastEmittedSearch: {
		cocktails: Cocktail[];
		searchString: string;
		page: number;
	} | null = null;

	/**
	 * Creates a new SearchbarComponent instance
	 * @param fb - FormBuilder for creating reactive forms
	 */
	constructor(
		private fb: FormBuilder,
		@Inject(PLATFORM_ID) private platformId: Object
	) {
		// Initialize form
		this.searchForm = this.fb.group({
			searchTerm: [''],
		});

		console.log('SearchbarComponent initialized');

		effect(() => {
			// Only trigger this effect when the resource is loaded, not pending
			if (this.SearchResource.isLoading()) return;

			// Only proceed if we're in 'dropdown' mode (NOT full mode) and have search results
			const mode = this.searchMode();
			if (mode === 'dropdown') {
				const results = this.SearchResource.value();
				const searchString = this.searchParams();
				const page = this.currentPage();

				if (
					results &&
					results.length > 0 &&
					searchString &&
					searchString.trim().length > 0
				) {
					const current = {
						cocktails: results,
						searchString,
						page,
					};

					const isSame =
						this.lastEmittedSearch &&
						this.lastEmittedSearch.searchString ===
							current.searchString &&
						this.lastEmittedSearch.page === current.page &&
						JSON.stringify(this.lastEmittedSearch.cocktails) ===
							JSON.stringify(current.cocktails);

					if (!isSame) {
						this.lastEmittedSearch = current;
					}
				}
			}
		});
	}

	/** HTTP resource for cocktail search results */
	SearchResource: Resource<Cocktail[]> = httpResource(
		() => {
			const currentFilters = this.filters();
			const searchString = this.searchParams();
			const pageSize = this.MaxResoults();
			const page = this.currentPage();
			const mode = this.searchMode();

			let params = new HttpParams()
				.set('SearchString', searchString)
				.set('PageSize', pageSize.toString())
				.set('Page', page.toString());

			if (mode !== 'dropdown') {
				// Add filter parameters only if not in dropdown mode
				if (currentFilters.IsAlcoholic !== 'NoPreference') {
					params = params.set(
						'IsAlcoholic',
						currentFilters.IsAlcoholic
					);
				}
				if (
					currentFilters.GlassNames &&
					currentFilters.GlassNames.length > 0
				) {
					currentFilters.GlassNames.forEach((glass) => {
						params = params.append('GlassNames', glass);
					});
				}
				if (
					currentFilters.Ingredients &&
					currentFilters.Ingredients.length > 0
				) {
					currentFilters.Ingredients.forEach((ingredient) => {
						params = params.append('Ingredients', ingredient);
					});
				}
				if (
					currentFilters.Creators &&
					currentFilters.Creators.length > 0
				) {
					currentFilters.Creators.forEach((creator) => {
						params = params.append('Creators', creator);
					});
				}
				if (
					currentFilters.Categories &&
					currentFilters.Categories.length > 0
				) {
					currentFilters.Categories.forEach((category) => {
						params = params.append('Category', category.name);
					});
				}
				if (currentFilters.AllIngredients) {
					params = params.set(
						'AllIngredients',
						currentFilters.AllIngredients
					);
				}
				if (currentFilters.ShowOnlyOriginal) {
					params = params.set(
						'ShowOnlyOriginal',
						currentFilters.ShowOnlyOriginal
					);
				}
			}

			// debug log
			this.searchCount++;
			console.log(
				`[Search Resource] Search Count: ${
					this.searchCount
				}, Search String: "${searchString}", Page: ${page}, Filters: ${JSON.stringify(
					currentFilters
				)}`
			);

			return {
				url: this.searchUrl,
				method: 'GET',
				params: params,
			};
		},
		{
			defaultValue: [
				new Cocktail(
					1,
					true,
					'Mojito',
					'Cocktail',
					false,
					{
						name: 'Highball glass',
						measure: 300,
					},
					[
						new Ingredient('White rum', '60', 'ml'),
						new Ingredient('Fresh lime juice', '30', 'ml'),
					],
					'Mix all ingredients in a glass and stir well.',
					'https://example.com/mojito.jpg'
				),
				new Cocktail(
					2,
					true,
					'Daiquiri',
					'Cocktail',
					false,
					{
						name: 'Cocktail glass',
						measure: 150,
					},
					[
						new Ingredient('White rum', '50', 'ml'),
						new Ingredient('Fresh lime juice', '25', 'ml'),
						new Ingredient('Simple syrup', '15', 'ml'),
					],
					'Simplify by shaking all ingredients with ice and straining into a chilled glass.',
					'https://example.com/daiquiri.jpg'
				),
			],
		}
	);

	/**
	 * Initializes the component
	 * Sets up form value change listeners
	 */
	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			this.searchUrl = environment.searchUrl;
			console.log('Setting search URL to:', this.searchUrl);

			// Setup debounced search
			this.searchForm
				.get('searchTerm')
				?.valueChanges.pipe(
					takeUntil(this.destroy$),
					debounceTime(this.DEBOUNCE_TIME_MS), // Wait for user to stop typing
					distinctUntilChanged(), // Only emit when value changes
					filter(
						(term) => !term || term.length >= this.MIN_SEARCH_LENGTH
					)
				)
				.subscribe((value) => {
					console.log(
						`[Search Debounced] Term: "${value}" (after ${this.DEBOUNCE_TIME_MS}ms debounce)`
					);
					this.searchParams.set(value || '');

					if (this.currentPage() > 1) {
						this.currentPage.set(1);
					}
				});
		}
	}

	/**
	 * Load more results by increasing the page number
	 */
	loadMoreResults() {
		this.currentPage.set(this.currentPage() + 1);
	}

	GotoCocktail(Searchres: Searchres) {
		// remove the text from the search bar
		this.searchParams.set('');
		this.searchForm.get('searchTerm')?.setValue('');
		this.cocktailSelected.emit(Searchres);
	}

	// Update performSearch in searchbar.component.ts
	performSearch() {
		const searchTerm = this.searchForm.get('searchTerm')?.value;

		if (!searchTerm || searchTerm.trim().length < this.MIN_SEARCH_LENGTH) {
			console.warn(`Search term too short: "${searchTerm}"`);
			return;
		}

		console.log(`Executing search for: "${searchTerm}"`);

		// In full mode, we need to emit the event AND navigate
		const searchFilters: SearchFilters = {
			...this.filters(),
			SearchString: searchTerm,
			Page: 1,
		};

		// Get current results if available
		const currentResults = this.SearchResource.value() || [];

		// Emit event with the search information
		this.continuedSearch.emit({
			cocktails: currentResults,
			searchString: searchTerm,
			page: 1,
		});

		// Clear the search input after performing search
		this.searchForm.get('searchTerm')?.setValue('');
	}
}
