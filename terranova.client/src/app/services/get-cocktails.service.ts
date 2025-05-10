import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Cocktail } from '../Classes/cocktail';

@Injectable({
	providedIn: 'root',
})
export class GetCocktailsService {
	private allCocktailsUrl = environment.allCocktailsUrl;
	private suggestionsUrl = environment.suggestedDrinksUrl;
	constructor(private http: HttpClient) {}

	/**
	 * Fetches all cocktails for a random list 
	 * @param PageSize - Number of cocktails to fetch
	 * @param Page - Page number for pagination
	 * @param OrderBy - Criteria to order the cocktails "id" | "name" | "random"
	 * 
	*/
	getAllCocktails(parameters: HttpParams) {
		return this.http.get<Cocktail[]>(this.allCocktailsUrl, { params: parameters });
	}

	getCocktailSuggestions() {
		return this.http.get<Cocktail[]>(this.suggestionsUrl);
	}
}
