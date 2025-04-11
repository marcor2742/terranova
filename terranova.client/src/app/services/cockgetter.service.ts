import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { HttpResourceRef, httpResource } from '@angular/common/http';
import { Cocktail, FullCocktail } from '../Classes/cocktail';
import { environment } from '../../environments/environment';

/**
 * Service for retrieving cocktail data from the API
 * Provides methods to get individual cocktails or lists of cocktails
 */
@Injectable({
  providedIn: 'root',
})
export class CockgetterService {
  private http = inject(HttpClient);
  private cocktailGetUrl = environment.cocktailGetUrl;
  
//   /**
//    * Retrieves a single cocktail by its ID
//    * @param id - The unique identifier of the cocktail to retrieve
//    * @returns An HTTP resource with the cocktail data and any potential errors
//    */
//   getCocktail(id: number): HttpResourceRef<FullCocktail> {
//     return httpResource<FullCocktail>({
//       url: `${this.cocktailGetUrl}/${id}`,
//       method: 'GET',
//     });
//   }
  
//   /**
//    * Retrieves multiple cocktails by their IDs
//    * @param ids - Array of cocktail IDs to retrieve
//    * @returns An HTTP resource with an array of cocktail data
//    */
//   getCocktails(ids: number[]): HttpResourceRef<FullCocktail[]> {
//     return httpResourceRef<FullCocktail[]>({
//       url: `${this.cocktailGetUrl}`,
//       method: 'GET',
//       params: { ids: ids.join(',') }
//     });
//   }
}