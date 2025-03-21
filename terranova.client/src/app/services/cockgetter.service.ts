import { HttpClient, HttpResourceRef } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Cocktail } from '../Classes/cocktail';
import { environment } from '../../environments/environment.development';

interface FullCocktail {
  Cocktail: Cocktail;
  errors?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CockgetterService {
  cocktailGetUrl = environment.cocktailGetUrl;
  
  getCocktailResource(cockId: number): HttpResourceRef<FullCocktail> {
  return httpResource<FullCocktail | undefined>(this.cocktailGetUrl + '/' + cockId) as HttpResourceRef<FullCocktail>;
  }
}