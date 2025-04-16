import { Component, input, output, Resource } from '@angular/core';
import {
	HlmCardContentDirective,
	HlmCardDescriptionDirective,
	HlmCardDirective,
	HlmCardHeaderDirective,
	HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';
import { httpResource } from '@angular/common/http';
import { Cocktail, FullCocktail, Ingredient } from '../Classes/cocktail';
import { environment } from '../../environments/environment.development';
import { TranslateModule } from '@ngx-translate/core';
import { InstructionsPipe } from '../pipes/instructions.pipe';
import { MeasurementPipe } from '../pipes/measurement.pipe';
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
		TranslateModule,
		MeasurementPipe,
		InstructionsPipe,
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
	readonly cocktailUrl = environment.searchUrl + '/' + this.cockId();

	readonly IsRemovable = input<boolean>(false);
	readonly removeCocktail = output<number>();

	cocktail: Resource<Cocktail> = httpResource<Cocktail>(
		() => ({ url: this.cocktailUrl, method: 'GET' }),
		{
			defaultValue: new Cocktail(
				1,
				true,
				'Mojito',
				'A refreshing Cuban cocktail with rum, mint, and lime.',
				{
					name: 'Highball glass',
					measure: 300,
				},
				[
					new Ingredient('White rum', '60 ml', '2 oz'),
					new Ingredient('Fresh lime juice', '30 ml', '1 oz'),
					new Ingredient('Sugar', '2 tsp', '1 tsp'),
					new Ingredient('Mint leaves', '8 oz', '1 cup'),
					new Ingredient('Soda water', '100 ml', '3.4 oz'),
				],
				'Mix all ingredients in a glass and stir well.',
				'https://example.com/mojito.jpg'
			),
		}
	);

	debugButton()
	{
		console.log('Resource:', this.cocktail.value());
	}

	// cocktail = {
	// 	isLoading: () => false,
	// 	error: () => null, // Return null for no error
	// 	value: () => ({
	// 	  Cocktail: {
	// 		Name: 'Mojito',
	// 		Description: 'A refreshing Cuban cocktail with rum, mint, and lime.',
	// 		ingredients: [
	// 		  { name: 'White rum', quantity: 60, measure: 'ml' },
	// 		  { name: 'Fresh lime juice', quantity: 30, measure: 'ml' },
	// 		  { name: 'Sugar', quantity: 2, measure: 'tsp' },
	// 		  { name: 'Mint leaves', quantity: 8, measure: 'oz' },
	// 		  { name: 'Soda water', quantity: 100, measure: 'ml' }
	// 		],
	// 		Instructions: 'Muddle mint with sugar and lime juice. Add rum and fill with ice. Top with soda water and garnish with mint.',
	// 		ImageUrl: 'https://drinkabile.cdaweb.it/wp-content/uploads/2021/10/Americano-cocktail.jpeg'
	// 	}
	// 	})
	//   };

	// ngOnDestroy(): void {
	// 	// Clean up the resource
	// 	this.cocktail.destroy();
	// }
}
