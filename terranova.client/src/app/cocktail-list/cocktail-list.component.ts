import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
	Component,
	inject,
	input,
	OnInit,
	output,
	OnDestroy,
	PLATFORM_ID,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollerModule } from 'primeng/scroller';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { CocktailCardComponent } from '../cocktail-card/cocktail-card.component';
import { Cocktail } from '../Classes/cocktail';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '../services/state-service.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription, take } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchFilters } from '../searchbar/searchbar.component';

@Component({
	selector: 'app-cocktail-list',
	imports: [
		CommonModule,
		TranslateModule,
		ScrollerModule,
		DividerModule,
		SkeletonModule,
		CocktailCardComponent,
	],
	templateUrl: './cocktail-list.component.html',
	styleUrl: './cocktail-list.component.scss',
})
export class CocktailListComponent implements OnInit, OnDestroy {
	private route = inject(ActivatedRoute);
	private stateService = inject(StateService);
	private http = inject(HttpClient);
	private platformId = inject(PLATFORM_ID);

	// Track subscriptions for cleanup
	private subscriptions = new Subscription();

	// Keep existing inputs/outputs
	close = output<string>();
	searchOrList = input<string>('search');
	cockTailList = input<number[]>([]);
	removeCock = output<number>();

	searchTerm: string = '';
	displayedCocktails: number[] = [];
	viewMode: 'search' | 'list' = 'search';

	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			// Subscribe to route parameters
			this.subscriptions.add(
				this.route.params.subscribe((params) => {
					// Check if we have a search term
					if (params['term']) {
						this.searchTerm = params['term'];
						this.viewMode = 'search';
						console.log('Search term from route:', this.searchTerm);
					}

					// Check if we have cocktail IDs in the route
					if (params['ids']) {
						this.viewMode = 'list';
						// Split comma-separated cocktail IDs
						const cocktailIds = params['ids'].split(',').map(Number);
						this.displayedCocktails = cocktailIds;

						// Update the state service with these IDs
						this.stateService.updateSelectedCocktails(cocktailIds);
						console.log('Cocktail IDs from route:', cocktailIds);
					}
				})
			);

			// Subscribe to search results if in search mode
			this.subscriptions.add(
				this.stateService.searchResults$.subscribe((results) => {
					if (this.viewMode === 'search' && results && results.length > 0) {
						const cocktailIds = results.map(
							(cocktail) => cocktail.id
						);
						this.displayedCocktails = cocktailIds;
						console.log(
							'CocktailList: Updated from search results:',
							cocktailIds
						);
					}
				})
			);

			// Subscribe to selected cocktails if in list mode
			this.subscriptions.add(
				this.stateService.selectedCocktails$.subscribe((cocktails) => {
					if (this.viewMode === 'list' && cocktails && cocktails.length > 0) {
						this.displayedCocktails = cocktails;
						console.log('CocktailList: Updated from selected cocktails:', cocktails);
					}
				})
			);
		}
	}

	ngOnDestroy() {
		this.subscriptions.unsubscribe();
	}

	removeCocktail(cocktailId: number) {
		this.removeCock.emit(cocktailId);

		// Also update the state service
		const updatedCocktails = this.displayedCocktails.filter(
			(id) => id !== cocktailId
		);
		this.stateService.updateSelectedCocktails(updatedCocktails);
	}
}
