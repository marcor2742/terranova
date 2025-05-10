import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
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
		DividerModule,
	],
	templateUrl: './for-you.component.html',
	styleUrl: './for-you.component.scss',
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
			setTimeout(() => {
				// Check login status
				this.isLoggedIn.set(this.tokenService.isLoggedin());

				// Fetch data after a delay
				if (this.isLoggedIn()) {
					this.loadSuggestedCocktails();
				}
				this.loadRandomCocktails();
			}, 100);
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
			},
		});
	}

	loadRandomCocktails() {
		// Don't start a new request if one is already in progress
		if (this.isLoadingRandom()) {
			console.log('Already loading random cocktails, skipping request');
			return;
		}

		this.isLoadingRandom.set(true);
		console.log(`Loading random cocktails page ${this.randomPage()}`);

		// Create parameters for random ordering
		const params = new HttpParams()
			.set('PageSize', this.pageSize().toString())
			.set('Page', this.randomPage().toString())
			.set('OrderBy', 'random');

		this.getCocktailsService.getAllCocktails(params).subscribe({
			next: (cocktails) => {
				console.log(
					`Random cocktails loaded (page ${this.randomPage()}):`,
					cocktails.length
				);

				// Only append if we received items
				if (cocktails.length > 0) {
					// Append new cocktails to existing ones for infinite scroll
					this.randomCocktails.set([
						...this.randomCocktails(),
						...cocktails,
					]);
				}

				this.isLoadingRandom.set(false);
			},
			error: (error) => {
				console.error('Error loading random cocktails:', error);
				this.isLoadingRandom.set(false);
			},
		});
	}

	loadMoreRandomCocktails() {
		if (!this.isLoadingRandom()) {
			this.randomPage.set(this.randomPage() + 1);
			this.loadRandomCocktails();
		}
	}
}
