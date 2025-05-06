import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Category {
	id: number;
	name: string;
	description: string | null;
}

@Injectable({
	providedIn: 'root',
})
export class CategoriesService {
	private categoriesUrl = environment.categoriesUrl;

	constructor(private http: HttpClient) {}

	getCategories(): Observable<Category[]> {
		return this.http.get<Category[]>(this.categoriesUrl).pipe(
			catchError((error) => {
				console.error('Error fetching categories:', error);
				return of([]);
			})
		);
	}
}
