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
	//user = httpResource<User>(this.userProfileUrl);
	user: Resource<User> | null = null;
	favCocktails: Resource<Cocktail[]> | null = null;
	carouselPage = signal<number>(1);
	carouselPageSize = signal<number>(20);

	userCreatedCocktails = computed(() => {
		if (this.user?.hasValue()) {
			return this.user.value()!.myDrinks;
		} else {
			return [];
		}
	});

	getNumVisForMyDrinks(): number {
		const myDrinksLength = this.userCreatedCocktails()?.length || 0;
		return myDrinksLength > 4 ? 4 : myDrinksLength;
	}

	cachedCocktails = signal<Cocktail[]>([]);

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
					defaultValue: [
						new Cocktail(
							-1,
							true,
							'Mojito',
							'Cocktail',
							false,
							{
								name: 'Highball glass',
								measure: 300,
							},
							[
								new Ingredient('White rum', '60', 'ml'),
								new Ingredient('Fresh lime juice', '30', 'ml'),
							],
							'Mix all ingredients in a glass and stir well.',
							'https://example.com/mojito.jpg'
						),
					],
				}
			);
		}
	}

	ngDoCheck() {
		if (this.favCocktails && this.favCocktails.hasValue()) {
			const newOnes = this.favCocktails.value()!.filter(
				(c) =>
					c.id > 0 && // Make sure it's not a default cocktail
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

	// Load more cocktails (next page)
	loadMoreCocktails() {
		console.log(this.cachedCocktails());
		this.carouselPage.set(this.carouselPage() + 1);
	}

	// For the carousel, use the cached array
	get carouselItems() {
		return this.cachedCocktails();
	}

	getNumvis(): number {
		const len = this.carouselItems.length;
		return len > 4 ? 4 : len;
	}
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
