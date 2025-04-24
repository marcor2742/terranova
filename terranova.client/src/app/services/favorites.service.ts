import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class FavoritesService {
	constructor( ) { }
	private http = inject(HttpClient)
	favUrl = environment.favoriteUrl;

	getFavorites() {
		return this.http.get<number[]>(`${this.favUrl}`);
	}

	addFavorite(cocktailId: number) {
		return this.http.post(`${this.favUrl}/${cocktailId}`, null);
	}

	removeFavorite(cocktailId: number) {
		return this.http.delete(`${this.favUrl}/${cocktailId}`);
	}

}
