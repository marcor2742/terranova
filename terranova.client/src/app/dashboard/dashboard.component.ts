import { Component, input, Resource, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CardModule } from 'primeng/card';
import { httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { User } from '../Classes/user';
import { CarouselModule } from 'primeng/carousel';
import { SkeletonModule } from 'primeng/skeleton';
import { Cocktail } from '../Classes/cocktail';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'app-dashboard',
	imports: [
		CommonModule,
		TranslateModule,
		CardModule,
		CarouselModule,
		SkeletonModule,
		ButtonModule,
	],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
	private userProfileUrl = environment.userProfileUrl;
	private favoriteUrl = environment.favoriteUrl;
	user = httpResource<User>(this.userProfileUrl);

	carouselPage = signal<number>(1);
	carouselPageSize = signal<number>(20);
	favCocktails = httpResource<Cocktail[]>(
		`${
			this.favoriteUrl
		}?page=${this.carouselPage()}&pageSize=${this.carouselPageSize()}`
	);

	cachedCocktails = signal<Cocktail[]>([]);

	ngDoCheck() {
        if (this.favCocktails.hasValue()) {
            const newOnes = this.favCocktails.value()!.filter(
                c => !this.cachedCocktails().some(existing => existing.id === c.id)
            );
            if (newOnes.length > 0) {
                this.cachedCocktails.set([...this.cachedCocktails(), ...newOnes]);
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
}
