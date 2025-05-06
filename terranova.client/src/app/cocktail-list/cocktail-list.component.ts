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

	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			// Read route parameters
			this.subscriptions.add(
				this.route.params.subscribe((params) => {
					if (params['term']) {
						this.searchTerm = params['term'];
						console.log('Search term from route:', this.searchTerm);
					}
				})
			);

			// Subscribe to search results instead of performing searches
			this.subscriptions.add(
				this.stateService.searchResults$.subscribe((results) => {
					if (results && results.length > 0) {
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

			this.subscriptions.add(
				this.stateService.selectedCocktails$.subscribe((cocktails) => {
					if (cocktails && cocktails.length > 0) {
						this.displayedCocktails = cocktails;
					}
				})
			);
		}
	}

	// REMOVE the performSearchFromURL method entirely
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
