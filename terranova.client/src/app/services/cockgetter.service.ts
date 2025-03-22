// import { HttpClient, HttpResourceFn } from '@angular/common/http';
// import { Injectable, inject } from '@angular/core';
// import { HttpResourceRef, httpResource } from '@angular/common/http';
// import { Cocktail } from '../Classes/cocktail';
// import { environment } from '../../environments/environment.development';

// type FullCocktail = {
//   Cocktail: Cocktail;
//   errors?: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class CockgetterService {
//   private http = inject(HttpClient);
//   private cocktailGetUrl = environment.cocktailGetUrl;
  

//   getCocktail(id: number): httpResource<FullCocktail> {
//     return httpResource<FullCocktail>(
// 		{
// 			url: `${this.cocktailGetUrl}/${id}`,
// 			method: 'GET',
// 		}
// 	);
//   }
  
//   getCocktails(id: number[]): HttpResourceRef<FullCocktail[]> {
//     return httpResource<FullCocktail[]>(`${this.cocktailGetUrl}`, (url) => 
// 		{
// 			url: `${this.cocktailGetUrl}`,
// 			method: 'GET',
// 		}
// 	);
//   }
// }