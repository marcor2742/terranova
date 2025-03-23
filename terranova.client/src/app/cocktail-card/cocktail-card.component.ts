import {
	Component,
	OnDestroy,
	computed,
	effect,
	inject,
	input,
} from '@angular/core';
import {
	HlmCardContentDirective,
	HlmCardDescriptionDirective,
	HlmCardDirective,
	HlmCardFooterDirective,
	HlmCardHeaderDirective,
	HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';
import { httpResource } from '@angular/common/http';
import { FullCocktail, ingredient } from '../Classes/cocktail';
import { environment } from '../../environments/environment.development';

@Component({
	selector: 'app-cocktail-card',
	standalone: true,
	imports: [
		HlmCardDirective,
		HlmCardHeaderDirective,
		HlmCardTitleDirective,
		HlmCardDescriptionDirective,
		HlmCardContentDirective,
		HlmSkeletonComponent,
	],
	templateUrl: './cocktail-card.component.html',
	styleUrl: './cocktail-card.component.scss',
})
export class CocktailCardComponent {
	readonly cockId = input<number>(1);
	readonly showAll = input<boolean>(true);
	readonly showSkeleton = input<boolean>(false);
	readonly cardWidth = input<string>('2500px');
	readonly cardHeight = input<string>('20px');
	readonly locale = input<string>('en-US');
	readonly cocktailUrl = environment.cocktailGetUrl + '/' + this.cockId() + '/' + this.locale();

	cocktail = {
		isLoading: () => false,
		error: () => null, // Return null for no error
		value: () => ({
		  Cocktail: {
			Name: 'Mojito',
			Description: 'A refreshing Cuban cocktail with rum, mint, and lime.',
			ingredients: [
			  { name: 'White rum', quantity: 60, measure: 'ml' },
			  { name: 'Fresh lime juice', quantity: 30, measure: 'ml' },
			  { name: 'Sugar', quantity: 2, measure: 'tsp' },
			  { name: 'Mint leaves', quantity: 8, measure: 'oz' },
			  { name: 'Soda water', quantity: 100, measure: 'ml' }
			],
			Instructions: 'Muddle mint with sugar and lime juice. Add rum and fill with ice. Top with soda water and garnish with mint.',
			ImageUrl: 'https://drinkabile.cdaweb.it/wp-content/uploads/2021/10/Americano-cocktail.jpeg'
		}
		})
	  };
	//   cocktail = httpResource<FullCocktail>(this.cocktailUrl);

	// ngOnDestroy(): void {
	// 	// Clean up the resource
	// 	this.cocktail.destroy();
	// }
}
