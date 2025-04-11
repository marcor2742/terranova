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
	searchForm: FormGroup;
	searchUrl = '';

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
	
	// /** HTTP resource for cocktail search results */
	// SearchResource: Resource<Cocktail[]> = httpResource(
	// 	() => ({
	// 		url: this.searchUrl,
	// 		method: 'GET',
	// 		params: {
	// 			searchString: this.searchParams(),
	// 			pageSize: this.MaxResoults(),
	// 			page: this.currentPage(),
	// 		},
	// 	}),
	// 	{
	// 		defaultValue: [
	// 			new Cocktail(
	// 				1,
	// 				true,
	// 				'Mojito',
	// 				'Cocktail',
	// 				{
	// 					name: 'Highball glass',
	// 					measure: 300,
	// 				},
	// 				[
	// 					new Ingredient('White rum', 60, 'ml'),
	// 					new Ingredient('Fresh lime juice', 30, 'ml'),
	// 					new Ingredient('Sugar', 2, 'tsp'),
	// 				],
	// 				'Mix all ingredients in a glass and stir well.',
	// 				'https://example.com/mojito.jpg'
	// 			),
	// 			new Cocktail(
	// 				2,
	// 				true,
	// 				'Daiquiri',
	// 				'Cocktail',
	// 				{
	// 					name: 'Cocktail glass',
	// 					measure: 150,
	// 				},
	// 				[
	// 					new Ingredient('White rum', 50, 'ml'),
	// 					new Ingredient('Fresh lime juice', 25, 'ml'),
	// 					new Ingredient('Sugar', 1, 'tsp'),
	// 				],
	// 				'Simplify by shaking all ingredients with ice and straining into a chilled glass.',
	// 				'https://example.com/daiquiri.jpg'
	// 			),
	// 		],
	// 	}
	// );
	private _searchResource?: Resource<Cocktail[]>;
  
	// Default cocktails to show during SSR and initial load
	private defaultCocktails: Cocktail[] = [
	  new Cocktail(
		1,
		true,
		'Mojito',
		'Cocktail',
		{ name: 'Highball glass', measure: 300 },
		// ...other details
	  ),
	  // ...other default cocktails
	];
	
	// Computed signal that safely accesses the resource
	get cocktails(): Resource<Cocktail[]> {
	  if (isPlatformBrowser(this.platformId)) {
		// Create the resource lazily on first access in browser
		if (!this._searchResource) {
		  this._searchResource = httpResource(
			() => ({
			  url: this.searchUrl || 'https://my-json-server.typicode.com/Bombatomica64/randomjson/cocktails',
			  method: 'GET',
			  params: {
				searchString: this.searchParams(),
				pageSize: this.MaxResoults(),
				page: this.currentPage(),
			  },
			}),
			{ defaultValue: this.defaultCocktails }
		  );
		}
		return this._searchResource;
	  }
	  
	  // Create a complete mock Resource for SSR
	  const mockLoadingSignal = signal<boolean>(false);
	  const mockErrorSignal = signal<unknown>(null);
	  
	  // Create a complete mock Resource for SSR with proper signals
	  const mockResource: Resource<Cocktail[]> = {
		// Core data accessor function
		value: () => this.defaultCocktails,
		
		// Loading state as a function
		isLoading: () => false,
		
		// Error handling with a signal
		error: mockErrorSignal as Signal<unknown>,
		
		// Resource methods
		retry: () => {},
		mutate: () => {},
		
		// Loading state as a signal
		loading: mockLoadingSignal as Signal<boolean>,
		
		// Refetch method returning a Promise
		refetch: () => Promise.resolve(this.defaultCocktails)
	  };
	  
	  return mockResource;
	}
	


	/**
	 * Initializes the component
	 * Sets up form value change listeners
	 */
	ngOnInit() {
		// Only subscribe to form changes in browser
		if (isPlatformBrowser(this.platformId)) {
			this.searchUrl = environment.searchUrl;
			this.searchForm
				.get('searchTerm')
				?.valueChanges.subscribe((value) => {
					console.log('Search term changed:', value);
					this.searchParams.set(value || '');
				});
		}
	}
	/**
	 * Load more results by increasing the page number
	 */
	loadMoreResults() {
		this.currentPage.set(this.currentPage() + 1);
		// The resource will automatically reload with the new page
	}

	GotoCocktail(Searchres: Searchres) {
		// Emit the selected cocktail
		this.cocktailSelected.emit(Searchres);
	}
}
