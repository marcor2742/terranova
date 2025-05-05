import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchFilters } from '../searchbar/searchbar.component';
import { Cocktail } from '../Classes/cocktail';

@Injectable({
	providedIn: 'root'
})
export class StateService {
	private selectedCocktailsSubject = new BehaviorSubject<number[]>([]);
	private filtersSubject = new BehaviorSubject<SearchFilters>({
		SearchString: '',
		PageSize: 10,
		Page: 1,
		IsAlcoholic: 'NoPreference',
		GlassNames: [],
		Creators: [],
		Category: '',
		Ingredients: [],
		AllIngredients: 'false',
		ShowOnlyOriginal: 'false'
	});
	private searchResultsSubject = new BehaviorSubject<Cocktail[]>([]);

	selectedCocktails$ = this.selectedCocktailsSubject.asObservable();
	filters$ = this.filtersSubject.asObservable();
	searchResults$ = this.searchResultsSubject.asObservable();

	updateSelectedCocktails(cocktails: number[]) {
		this.selectedCocktailsSubject.next(cocktails);
	}

	updateFilters(filters: SearchFilters) {
		this.filtersSubject.next(filters);
	}

	updateSearchResults(results: Cocktail[]) {
		this.searchResultsSubject.next(results);
	}
}
