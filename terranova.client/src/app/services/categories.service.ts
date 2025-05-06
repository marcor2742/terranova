import { Injectable } from '@angular/core';
import { Glass } from '../Classes/cocktail';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, catchError } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class CategoriesService {
	private categoriesUrl = environment.categoriesUrl;
	constructor(private http: HttpClient) {}

	getCategories(): Observable<string[]> {
		return this.http.get<string[]>(this.categoriesUrl)
		  .pipe(
			catchError(error => {
			  console.error('Error fetching categories:', error);
			  return of([]); // Return empty array on error
			})
		  );
	}
}
