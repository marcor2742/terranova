import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cocktail-list',
  imports: [CommonModule,TranslateModule],
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
}
