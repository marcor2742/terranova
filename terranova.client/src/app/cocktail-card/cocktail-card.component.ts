import { Component, effect, Inject, input, OnInit, output, PLATFORM_ID, Resource, Signal, signal } from '@angular/core';
import {
	HlmCardContentDirective,
	HlmCardDescriptionDirective,
	HlmCardDirective,
	HlmCardHeaderDirective,
	HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';
import { httpResource } from '@angular/common/http';
import { Cocktail } from '../Classes/cocktail';
import { environment } from '../../environments/environment.development';
import { TranslateModule } from '@ngx-translate/core';
import { InstructionsPipe } from '../pipes/instructions.pipe';
import { MeasurementPipe } from '../pipes/measurement.pipe';
import { SettingsService } from '../services/setting-service.service';
import { ButtonComponent } from '../../../projects/my-ui/src/lib/button/button.component';
import { ButtonModule } from 'primeng/button';
import { FavoritesService } from '../services/favorites.service';
import { isPlatformBrowser } from '@angular/common';
import { inject } from '@angular/core';
@Component({
	selector: 'app-cocktail-card',
	standalone: true,
	imports: [
		HlmCardDirective,
		HlmCardHeaderDirective,
		HlmCardTitleDirective,
		HlmCardContentDirective,
		HlmSkeletonComponent,
		TranslateModule,
		MeasurementPipe,
		InstructionsPipe,
		ButtonComponent,
		ButtonModule,
	],
	templateUrl: './cocktail-card.component.html',
	styleUrl: './cocktail-card.component.scss',
})
export class CocktailCardComponent implements OnInit {
	readonly cockId = input<number>();
	readonly showAll = input<boolean>(true);
	readonly showSkeleton = input<boolean>(false);
	readonly cardWidth = input<string>('100%');
	readonly cardHeight = input<string>('auto');
	readonly locale = input<string>('en-US');

	readonly IsRemovable = input<boolean>(false);
	readonly removeCocktail = output<number>();

	isFavorite = signal<boolean>(false);
	private favoriteService = inject(FavoritesService)
    private platformId = inject(PLATFORM_ID);
    public settingService = inject(SettingsService);


	// cocktail = httpResource<Cocktail>(`${environment.searchUrl}/${this.cockId()}`);
	cocktail = httpResource<Cocktail>(() => {
		const id = this.cockId();
		console.log('Resource factory executed with ID:', id);

		if (!id) {
			// Return null or throw an error to show in error state
			throw new Error('No cocktail ID provided');
		}

		return `${environment.searchUrl}/${id}`;
	});

	constructor() {
        // Effect runs when cocktail resource successfully loads data
        effect(() => {
            const currentCocktail = this.cocktail.value(); // Get the loaded cocktail data

            // Check only if loading succeeded and we have data
            if (isPlatformBrowser(this.platformId) && this.cocktail.hasValue()) {
                console.log(`CocktailCard: Cocktail ${this.cocktail.value().id} loaded. Checking favorite status.`);
                this.isFavorite.set(this.cocktail.value().favorite ?? false);
            }
        });
    }

	debugButton() {
		console.log('Resource:', this.cocktail.value());
	}

	remCock(event: number) {
		this.removeCocktail.emit(event);
	}

	addFavorite() {
		if (this.cockId() === undefined) {
			console.error('Error: Cocktail ID is undefined.');
			return;
		}

		this.favoriteService.addFavorite(this.cockId() as number).subscribe({
			next: (response) => {
				console.log('Favorite added:', response);
			},
			error: (error) => {
				console.error('Error adding favorite:', error);
			},
		});
	}
	removeFavorite() {
		if (this.cockId() === undefined) {
			console.error('Error: Cocktail ID is undefined.');
			return;
		}
		this.favoriteService.removeFavorite(this.cockId() as number).subscribe({
			next: (response) => {
				console.log('Favorite removed:', response);
			},
			error: (error) => {
				console.error('Error removing favorite:', error);
			},
		});
	}
	ngOnInit() {
		console.log('CocktailCardComponent initialized');
		//if (isPlatformBrowser(this.platformId)) {
		//	const cocktailId = this.cockId();
		//	if (cocktailId === undefined) {
		//		console.error('Error: Cocktail ID is undefined.');
		//		return;
		//	}
		//	if (this.cocktail.hasValue()) {
		//		this.isFavorite.set(this.cocktail.value()?.favorite ?? false);
		//		console.log('Cocktail loaded:', this.cocktail.value());
		//	}
		//	else
		//	{
		//		setTimeout(() => this.loadIfisFav(), 100);
		//	}
		//}
	}

	//loadIfisFav() {
	//	if (this.cocktail.hasValue()) {
	//		this.isFavorite.set(this.cocktail.value()?.favorite ?? false);
	//	}
	//	else {
	//		console.log('Cocktail not loaded yet, checking again...');
	//		// Se il cocktail non è ancora caricato, ricontrolliamo tra poco
	//		setTimeout(() => this.loadIfisFav(), 200);
	//	}
	//}

	//private _hasAlreadyFetched = false;
	//ngOnInit() {
	//	if (isPlatformBrowser(this.platformId)) {
	//		const cocktailId = this.cockId();
	//		if (cocktailId === undefined) {
	//			return;
	//		}

	//		if (this._hasAlreadyFetched) {
	//			console.log('Favorite status already fetched');
	//			return;
	//		}

	//		console.log('Checking favorite status for cocktail:', cocktailId);
	//		this._hasAlreadyFetched = true;


	//		this.favoriteService.IsFavorite(cocktailId).subscribe((isFavorite) => {
	//			console.log('isFavorite:', isFavorite);
	//			if (isFavorite) {
	//				this.isFavorite.set(true);
	//			} else {
	//				this.isFavorite.set(false);
	//			}
	//		});
	//		console.log('isFavorite:', this.isFavorite());
	//	}
	//}

	toggleFavorite() {
		if (this.cockId() === undefined) {
			console.error('Error: Cocktail ID is undefined.');
			return;
		}

		if (this.isFavorite()) {
			this.favoriteService.removeFavorite(this.cockId() as number).subscribe({
				next: () => {
					this.isFavorite.set(false);
					console.log('Favorite removed');
				},
				error: (error) => {
					console.error('Error removing favorite:', error);
				}
			});
		} else {
			this.favoriteService.addFavorite(this.cockId() as number).subscribe({
				next: () => {
					this.isFavorite.set(true);
					console.log('Favorite added');
				},
				error: (error) => {
					console.error('Error adding favorite:', error);
				}
			});
		}
	}

}


