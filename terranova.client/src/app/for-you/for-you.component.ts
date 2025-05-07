import { Component, inject, OnInit, signal, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GetCocktailsService } from '../services/get-cocktails.service';
import { TokenStoreService } from '../services/token-store.service';
import { CocktailCarouselComponent } from '../cocktail-carousel/cocktail-carousel.component';
import { Cocktail } from '../Classes/cocktail';
import { HttpParams } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-for-you',
  standalone: true,
  imports: [
    CommonModule,
    CocktailCarouselComponent,
    TranslateModule,
    CardModule,
    DividerModule
  ],
  templateUrl: './for-you.component.html',
  styleUrl: './for-you.component.scss'
})
export class ForYouComponent implements OnInit {
  private getCocktailsService = inject(GetCocktailsService);
  private tokenService = inject(TokenStoreService);
  private platformId = inject(PLATFORM_ID);
  
  // State management
  isLoggedIn = signal<boolean>(false);
  isLoadingSuggestions = signal<boolean>(false);
  isLoadingRandom = signal<boolean>(false);
  
  // Cocktail data
  suggestedCocktails = signal<Cocktail[]>([]);
  randomCocktails = signal<Cocktail[]>([]);
  
  // Pagination for random cocktails
  randomPage = signal<number>(1);
  pageSize = signal<number>(10);
  
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Check login status
      this.isLoggedIn.set(this.tokenService.isLoggedin());
      
      // Fetch suggested cocktails if logged in
      if (this.isLoggedIn()) {
        this.loadSuggestedCocktails();
      }
      
      // Fetch random cocktails for everyone
      this.loadRandomCocktails();
    }
  }
  
  loadSuggestedCocktails() {
    this.isLoadingSuggestions.set(true);
    this.getCocktailsService.getCocktailSuggestions().subscribe({
      next: (suggestions) => {
        console.log('Suggested cocktails loaded:', suggestions.length);
        this.suggestedCocktails.set(suggestions);
        this.isLoadingSuggestions.set(false);
      },
      error: (error) => {
        console.error('Error loading suggested cocktails:', error);
        this.isLoadingSuggestions.set(false);
      }
    });
  }
  
  loadRandomCocktails() {
    this.isLoadingRandom.set(true);
    
    // Create parameters for random ordering
    const params = new HttpParams()
      .set('PageSize', this.pageSize().toString())
      .set('Page', this.randomPage().toString())
      .set('OrderBy', 'random');
      
    this.getCocktailsService.getAllCocktails(params).subscribe({
      next: (cocktails) => {
        console.log('Random cocktails loaded:', cocktails.length);
        // Append new cocktails to existing ones for infinite scroll
        this.randomCocktails.set([...this.randomCocktails(), ...cocktails]);
        this.isLoadingRandom.set(false);
      },
      error: (error) => {
        console.error('Error loading random cocktails:', error);
        this.isLoadingRandom.set(false);
      }
    });
  }
  
  loadMoreRandomCocktails() {
    if (!this.isLoadingRandom()) {
      this.randomPage.set(this.randomPage() + 1);
      this.loadRandomCocktails();
    }
  }
}