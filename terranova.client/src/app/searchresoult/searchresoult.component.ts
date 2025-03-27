import { Component, input, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { CockResoults, Cocktail } from '../Classes/cocktail';

@Component({
	selector: 'app-searchresoult',
	imports: [MatListModule],
	templateUrl: './searchresoult.component.html',
	styleUrl: './searchresoult.component.scss',
})
export class SearchresoultComponent {
	@Input() ResoultSize: CockResoults = 'small';
	@Input() Cocktail!: Cocktail;
}
