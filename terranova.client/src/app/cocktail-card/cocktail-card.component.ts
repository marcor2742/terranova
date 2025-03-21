import { Component, computed, inject, input } from '@angular/core';
import {
	HlmCardContentDirective,
	HlmCardDescriptionDirective,
	HlmCardDirective,
	HlmCardFooterDirective,
	HlmCardHeaderDirective,
	HlmCardTitleDirective,
} from '@spartan-ng/ui-card-helm';
import { HlmSkeletonComponent } from '@spartan-ng/ui-skeleton-helm';
import { CockgetterService } from '../services/cockgetter.service';

@Component({
	selector: 'app-cocktail-card',
	imports: [],
	templateUrl: './cocktail-card.component.html',
	styleUrl: './cocktail-card.component.scss',
})
export class CocktailCardComponent {
	readonly cockId = input(1);
	readonly showAll = input(false);

	private cocktailLoader = inject(CockgetterService);

	cocktail = computed(() => {
		const id = this.cockId();
		return this.cocktailLoader.getCocktailResource(id);
	});

}
