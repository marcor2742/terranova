import {
	Component,
	effect,
	ErrorHandler,
	Inject,
	input,
	OnInit,
	output,
	PLATFORM_ID,
	Resource,
	Signal,
	signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
	HlmCardContentDirective,
	HlmCardDescriptionDirective,
	HlmCardDirective,
	HlmCardHeaderDirective,
	HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';
import {
	HttpErrorResponse,
	httpResource,
	HttpResponse,
} from '@angular/common/http';
import { Cocktail } from '../Classes/cocktail';
import { environment } from '../../environments/environment.development';
import { TranslateModule } from '@ngx-translate/core';
import { InstructionsPipe } from '../pipes/instructions.pipe';
import { MeasurementPipe } from '../pipes/measurement.pipe';
import { SettingsService } from '../services/setting-service.service';
import { ButtonComponent } from '../../../projects/my-ui/src/lib/button/button.component';
import { ButtonModule } from 'primeng/button';
import { FavoritesService } from '../services/favorites.service';
import { inject } from '@angular/core';
import { catchError, of } from 'rxjs';

@Component({
	selector: 'app-cocktail-card',
	standalone: true,
	imports: [
		CommonModule,
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
	private route = inject(ActivatedRoute);
	private favoriteService = inject(FavoritesService);
	private platformId = inject(PLATFORM_ID);
	public settingService = inject(SettingsService);

	// Inputs and outputs
	readonly cockId = input<number | undefined>(undefined);
	readonly showAll = input<boolean>(true);
	readonly showSkeleton = input<boolean>(false);
	readonly cardWidth = input<string>('100%');
	readonly cardHeight = input<string>('auto');
	readonly locale = input<string>('en-US');
	readonly IsRemovable = input<boolean>(false);
	readonly removeCocktail = output<number>();

	// State
	isFavorite = signal<boolean>(false);
	resolvedCocktailId = signal<number>(-1);
	isNotFound = signal<boolean>(false);

	// Track whether we're ready to fetch data or not
	private shouldFetchData = signal<boolean>(false);

	cocktail: Resource<Cocktail> | null = null;

	constructor() {
		if (isPlatformBrowser(this.platformId)) {
			this.cocktail = httpResource<Cocktail>(
				() => {
					const id = this.resolvedCocktailId();
					const envUrl = environment.searchUrl;
					return `${envUrl}/${id}`;
				},
				{ defaultValue: new Cocktail(0, false, '', '') }
			);
			// Effect runs when cocktail resource successfully loads data
			effect(() => {
				// Only run when the data is actually available
				if (
					isPlatformBrowser(this.platformId) &&
					this.cocktail?.hasValue()
				) {
					const cocktailData = this.cocktail.value();
					if (!this.isValidCocktail(cocktailData)) {
						console.error(
							'Invalid cocktail data received:',
							cocktailData
						);
						this.isNotFound.set(true);
						return;
					}
					this.isFavorite.set(
						this.cocktail.value().favorite ?? false
					);
				}
			});
		}
	}

	// Add this helper method to validate cocktail object
	private isValidCocktail(obj: any): boolean {
		return (
			obj &&
			typeof obj === 'object' &&
			typeof obj.id === 'number' &&
			typeof obj.name === 'string' &&
			Array.isArray(obj.ingredients)
		);
	}

	ngOnInit() {
		console.log('CocktailCardComponent initialized');

		if (isPlatformBrowser(this.platformId)) {
			// First check if we have an input ID
			const inputId = this.cockId();
			console.log('Input ID:', inputId);
			if (inputId !== undefined) {
				console.log('Using ID from input:', inputId);
				this.resolvedCocktailId.set(inputId);
				this.shouldFetchData.set(true); // Now safe to fetch
			} else {
				// If no input ID, get it from the route params
				this.route.paramMap.subscribe((params) => {
					const routeId = params.get('id');
					if (routeId) {
						const numericId = parseInt(routeId, 10);
						console.log('Using ID from route params:', numericId);
						this.resolvedCocktailId.set(numericId);
						this.shouldFetchData.set(true);
					} else {
						console.error(
							'No cocktail ID found in route parameters'
						);
					}
				});
			}
		}
	}

	debugButton() {
		console.log('Resource:', this.cocktail?.value());
	}

	remCock(event: number) {
		this.removeCocktail.emit(event);
	}

	toggleFavorite() {
		const id = this.resolvedCocktailId();
		if (id === undefined) {
			console.error('Error: Cocktail ID is undefined.');
			return;
		}

		if (this.isFavorite()) {
			this.favoriteService.removeFavorite(id).subscribe({
				next: () => {
					this.isFavorite.set(false);
					console.log('Favorite removed');
				},
				error: (error) => {
					console.error('Error removing favorite:', error);
				},
			});
		} else {
			this.favoriteService.addFavorite(id).subscribe({
				next: () => {
					this.isFavorite.set(true);
					console.log('Favorite added');
				},
				error: (error) => {
					console.error('Error adding favorite:', error);
				},
			});
		}
	}

	addFavorite() {
		const id = this.resolvedCocktailId();
		if (id === undefined) {
			console.error('Error: Cocktail ID is undefined.');
			return;
		}

		this.favoriteService.addFavorite(id).subscribe({
			next: (response) => {
				console.log('Favorite added:', response);
			},
			error: (error) => {
				console.error('Error adding favorite:', error);
			},
		});
	}

	removeFavorite() {
		const id = this.resolvedCocktailId();
		if (id === undefined) {
			console.error('Error: Cocktail ID is undefined.');
			return;
		}

		this.favoriteService.removeFavorite(id).subscribe({
			next: (response) => {
				console.log('Favorite removed:', response);
			},
			error: (error) => {
				console.error('Error removing favorite:', error);
			},
		});
	}
}
