import {
	Component,
	input,
	Resource,
	signal,
	computed,
	Inject,
	PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { User } from '../Classes/user';
import { CarouselModule } from 'primeng/carousel';
import { SkeletonModule } from 'primeng/skeleton';
import { Cocktail, Ingredient } from '../Classes/cocktail';
import { ButtonModule } from 'primeng/button';
import { CocktailCarouselComponent } from '../cocktail-carousel/cocktail-carousel.component';
import { RouterModule } from '@angular/router';

/**
 * Component responsible for displaying the user's dashboard.
 * It shows user information, their created cocktails, and their favorite cocktails.
 */
@Component({
	selector: 'app-dashboard',
	imports: [
		CommonModule,
		TranslateModule,
		CardModule,
		CarouselModule,
		SkeletonModule,
		ButtonModule,
		CocktailCarouselComponent,
		RouterModule,
	],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
	private userProfileUrl = environment.userProfileUrl;
	private favoriteUrl = environment.favoriteUrl;
	user: Resource<User> | null = null;
	favCocktails: Resource<Cocktail[]> | null = null;
	carouselPage = signal<number>(1);
	carouselPageSize = signal<number>(20);

	/**
	 * A computed signal that returns the cocktails created by the user.
	 * Returns an empty array if the user data is not yet available.
	 */
	userCreatedCocktails = computed(() => {
		if (this.user?.hasValue()) {
			return this.user.value()!.myDrinks;
		} else {
			return [];
		}
	});

	/**
	 * Determines the number of visible items for the 'My Drinks' carousel.
	 * It shows a maximum of 4 items, or fewer if the user has created less than 4 cocktails.
	 * @returns {number} The number of items to display in the 'My Drinks' carousel.
	 */
	getNumVisForMyDrinks(): number {
		const myDrinksLength = this.userCreatedCocktails()?.length || 0;
		return myDrinksLength > 4 ? 4 : myDrinksLength;
	}

	cachedCocktails = signal<Cocktail[]>([]);

	/**
	 * Initializes the component, fetching user data and favorite cocktails if running in a browser environment.
	 * @param {Object} platformId - An Angular token that identifies the platform (browser or server).
	 */
	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
		if (isPlatformBrowser(this.platformId)) {
			this.user = httpResource<User>(this.userProfileUrl, {
				defaultValue: new User('stuff', 'stuff@stuff.cm', 'stuffers'),
			});

			this.favCocktails = httpResource<Cocktail[]>(
				`${
					this.favoriteUrl
				}?page=${this.carouselPage()}&pageSize=${this.carouselPageSize()}`,
				{
					defaultValue: [],
				}
			);
		}
	}

	/**
	 * Angular lifecycle hook that performs custom change detection.
	 * It checks for new favorite cocktails and adds them to the cached list,
	 * ensuring no duplicates and filtering out default/placeholder cocktails.
	 */
	ngDoCheck() {
		if (this.favCocktails && this.favCocktails.hasValue()) {
			const newOnes = this.favCocktails.value()!.filter(
				(c) =>
					c.id > 0 && 
					!this.cachedCocktails().some(
						(existing) => existing.id === c.id
					)
			);

			if (newOnes.length > 0) {
				this.cachedCocktails.set([
					...this.cachedCocktails(),
					...newOnes,
				]);
			}
		}
	}

	/**
	 * Loads the next page of favorite cocktails for the carousel.
	 * Increments the carouselPage signal, which triggers a new fetch by the httpResource.
	 */
	loadMoreCocktails() {
		console.log(this.cachedCocktails());
		this.carouselPage.set(this.carouselPage() + 1);
	}

	/**
	 * Getter for the cocktails to be displayed in the favorites carousel.
	 * @returns {Cocktail[]} The array of cached favorite cocktails.
	 */
	get carouselItems() {
		return this.cachedCocktails();
	}

	/**
	 * Determines the number of visible items for the favorites carousel.
	 * Shows a maximum of 4 items, or fewer if there are less than 4 favorite cocktails.
	 * @returns {number} The number of items to display in the favorites carousel.
	 */
	getNumvis(): number {
		const len = this.carouselItems.length;
		return len > 4 ? 4 : len;
	}

	/**
	 * Getter to determine if the carousels should be in a disabled (loading) state.
	 * @returns {boolean} True if user data or favorite cocktails are currently loading (in browser), false otherwise.
	 */
	get Disabled(): boolean {
		if (isPlatformBrowser(this.platformId)) {
			return (
				this.favCocktails?.isLoading() ||
				this.user?.isLoading() ||
				false
			);
		} else {
			return false;
		}
	}
}
