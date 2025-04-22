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
import { httpResource } from '@angular/common/http';

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

	readonly cocktailSelected = output<Searchres>();

	readonly continuedSearch = output<string>();

	searchForm: FormGroup;
	searchUrl = '';

	private readonly DEBOUNCE_TIME_MS = 300;

	/** Minimum characters to trigger search */
	private readonly MIN_SEARCH_LENGTH = 1;

	/** Tracks component lifecycle for unsubscribing */
	private destroy$ = new Subject<void>();

	/** Tracks search count for debugging */
	private searchCount = 0;

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
	}

	/** HTTP resource for cocktail search results */
	SearchResource: Resource<Cocktail[]> = httpResource(
		() => {
			// Debug the API call
			this.searchCount++;
			console.log(`[Search API Call #${this.searchCount}]`, {
				url: this.searchUrl,
				searchString: this.searchParams(),
				pageSize: this.MaxResoults(),
				page: this.currentPage(),
			});

			return {
				url: this.searchUrl,
				method: 'GET',
				params: {
					searchString: this.searchParams(),
					pageSize: this.MaxResoults(),
					page: this.currentPage(),
				},
			};
		},
		{
			defaultValue: [
				new Cocktail(
					1,
					true,
					'Mojito',
					'Cocktail',
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

	performSearch() {
		const searchTerm = this.searchForm.get('searchTerm')?.value;
		if (searchTerm && searchTerm.length >= this.MIN_SEARCH_LENGTH) {
			this.searchParams.set(searchTerm);
			this.continuedSearch.emit(searchTerm);
		}
	}
}
