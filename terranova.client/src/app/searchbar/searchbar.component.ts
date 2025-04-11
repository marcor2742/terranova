import {
	Component,
	input,
	Resource,
	signal,
	OnInit,
	Output,
	EventEmitter,
} from '@angular/core';
import { environment } from '../../environments/environment';
import {
	Searchres,
	SearchresoultComponent,
} from '../searchresoult/searchresoult.component';
import { CockResoults, Cocktail, Ingredient } from '../Classes/cocktail';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
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

	@Output() cocktailSelected = new EventEmitter<Searchres>();
	/** URL for search API endpoint */
	searchUrl = environment.searchUrl;

	/** Form for search input */
	searchForm: FormGroup;

	/** HTTP resource for cocktail search results */
	SearchResource: Resource<Cocktail[]> = httpResource(
		() => ({
			url: 'https://my-json-server.typicode.com/Bombatomica64/randomjson/cocktails',
			method: 'GET',
			params: {
				searchString: this.searchParams(),
				pageSize: this.MaxResoults(),
				page: this.currentPage(),
			},
		}),
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
						new Ingredient('White rum', 60, 'ml'),
						new Ingredient('Fresh lime juice', 30, 'ml'),
						new Ingredient('Sugar', 2, 'tsp'),
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
						new Ingredient('White rum', 50, 'ml'),
						new Ingredient('Fresh lime juice', 25, 'ml'),
						new Ingredient('Sugar', 1, 'tsp'),
					],
					'Simplify by shaking all ingredients with ice and straining into a chilled glass.',
					'https://example.com/daiquiri.jpg'
				),
			],
		}
	);

	/**
	 * Creates a new SearchbarComponent instance
	 * @param fb - FormBuilder for creating reactive forms
	 */
	constructor(private fb: FormBuilder) {
		// Initialize form
		this.searchForm = this.fb.group({
			searchTerm: [''],
		});

		console.log('SearchbarComponent initialized');
	}

	/**
	 * Initializes the component
	 * Sets up form value change listeners
	 */
	ngOnInit() {
		// Subscribe to form value changes
		this.searchForm.get('searchTerm')?.valueChanges.subscribe((value) => {
			console.log('Search term changed:', value);
			this.searchParams.set(value || '');
		});
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
