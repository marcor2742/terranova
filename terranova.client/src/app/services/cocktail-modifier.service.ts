import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Cocktail } from '../Classes/cocktail';

@Injectable({
	providedIn: 'root',
})
export class CocktailModifierService {
	private editCocktailUrl = environment.editCocktailUrl;
	constructor(private http: HttpClient) {}

	createCocktail(cocktail: any) {
		return this.http.post<Cocktail>(this.editCocktailUrl, cocktail);
	}

	editCocktail(cocktail: any, id: number) {
		return this.http.put(`${this.editCocktailUrl}/${id}`, cocktail);
	}

	deleteCocktail(cocktailId: number) {
		return this.http.delete(`${this.editCocktailUrl}/${cocktailId}`);
	}
}
