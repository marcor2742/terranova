// In state-service.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SearchFilters } from '../searchbar/searchbar.component';
import { Cocktail } from '../Classes/cocktail';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class StateService {
	private http = inject(HttpClient);
	private searchUrl = environment.searchUrl;

	// Existing subjects
	private selectedCocktailsSubject = new BehaviorSubject<number[]>([]);
	private filtersSubject = new BehaviorSubject<SearchFilters>({
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

	private searchResultsSubject = new BehaviorSubject<Cocktail[]>([]);
	private _searchTrigger = new Subject<SearchFilters>();

	// Public observables
	selectedCocktails$ = this.selectedCocktailsSubject.asObservable();
	filters$ = this.filtersSubject.asObservable();
	searchResults$ = this.searchResultsSubject.asObservable();
	searchTrigger$ = this._searchTrigger.asObservable();

	// Methods
	updateSelectedCocktails(cocktails: number[]) {
		this.selectedCocktailsSubject.next(cocktails);
	}

	updateFilters(filters: SearchFilters) {
		this.filtersSubject.next(filters);
	}

	updateSearchResults(results: Cocktail[]) {
		this.searchResultsSubject.next(results);
	}

	// CENTRALIZED SEARCH METHOD
	performSearch(filters: SearchFilters) {
		console.log('StateService performing search with filters:', filters);

		// Build search parameters
		let params = new HttpParams()
			.set('SearchString', filters.SearchString)
			.set('PageSize', filters.PageSize.toString())
			.set('Page', filters.Page.toString());

		// Add other filter parameters
		if (filters.IsAlcoholic !== 'NoPreference') {
			params = params.set('IsAlcoholic', filters.IsAlcoholic);
		}
		if (filters.GlassNames && filters.GlassNames.length > 0) {
			filters.GlassNames.forEach((glass) => {
				params = params.append('GlassNames', glass);
			});
		}
		if (filters.Ingredients && filters.Ingredients.length > 0) {
			filters.Ingredients.forEach((ingredient) => {
				params = params.append('Ingredients', ingredient);
			});
		}
		if (filters.Categories && filters.Categories.length > 0) {
			filters.Categories.forEach((category) => {
				params = params.append('Category', category.name);
			});
		}
		if (filters.AllIngredients === 'true') {
			params = params.set('AllIngredients', filters.AllIngredients);
		}
		if (filters.ShowOnlyOriginal === 'true') {
			params = params.set('ShowOnlyOriginal', filters.ShowOnlyOriginal);
		}

		// Execute the search
		this.http.get<Cocktail[]>(this.searchUrl, { params }).subscribe({
			next: (results) => {
				console.log(`Search returned ${results.length} results`);

				// Update results in state
				this.updateSearchResults(results);

				// Update selected cocktails if there are results
				if (results.length > 0) {
					const cocktailIds = results.map((cocktail) => cocktail.id);
					this.updateSelectedCocktails(cocktailIds);
				} else {
					// Clear selected cocktails if no results found
					this.updateSelectedCocktails([]);
				}

				// Trigger search with updated filters
				this._searchTrigger.next(filters);
			},
			error: (err) => {
				console.error('Error performing search:', err);
				// Also clear results on error
				this.updateSearchResults([]);
				this.updateSelectedCocktails([]);
			},
		});
	}

	// Get current filters (helper method)
	getFilters(): SearchFilters {
		return this.filtersSubject.getValue();
	}
}
