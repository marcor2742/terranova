import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollerModule } from 'primeng/scroller';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { CocktailCardComponent } from '../cocktail-card/cocktail-card.component';
import { Cocktail } from '../Classes/cocktail';

@Component({
  selector: 'app-cocktail-list',
  imports: [CommonModule, TranslateModule, ScrollerModule, DividerModule, SkeletonModule, CocktailCardComponent],
  templateUrl: './cocktail-list.component.html',
  styleUrl: './cocktail-list.component.scss'
})
export class CocktailListComponent {
	close = output<string>();

	closeCocktailList() {
		this.close.emit('close');
	}
	searchOrList = input<string>('search');
	cockTailList = input<number[]>([]);
	removeCock = output<number>();

	removeCocktail(cocktailId: number) {
		this.removeCock.emit(cocktailId);
	}

}
