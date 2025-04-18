import { Component, input, OnInit, output, Resource } from '@angular/core';
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
	],
	templateUrl: './cocktail-card.component.html',
	styleUrl: './cocktail-card.component.scss',
})
export class CocktailCardComponent {
	readonly cockId = input<number>();
	readonly showAll = input<boolean>(true);
	readonly showSkeleton = input<boolean>(false);
	readonly cardWidth = input<string>('100%');
	readonly cardHeight = input<string>('auto');
	readonly locale = input<string>('en-US');

	readonly IsRemovable = input<boolean>(false);
	readonly removeCocktail = output<number>();

	constructor(public settingService: SettingsService) {}

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

	debugButton() {
		console.log('Resource:', this.cocktail.value());
	}

	remCock(event: number) {
		this.removeCocktail.emit(event);
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
