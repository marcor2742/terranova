import { Component, input, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { CockResoults, Cocktail } from '../Classes/cocktail';

/**
 * Component for displaying a single cocktail search result
 * Renders cocktail information with different size options
 */
@Component({
	selector: 'app-searchresoult',
	imports: [MatListModule],
	templateUrl: './searchresoult.component.html',
	styleUrl: './searchresoult.component.scss',
})
export class SearchresoultComponent {
	/**
	 * Controls the size of the displayed result
	 * Can be 'small', 'medium', or 'large'
	 */
	@Input() ResoultSize: CockResoults = 'small';
	
	/**
	 * The cocktail data to display
	 */
	@Input() Cocktail!: Cocktail;
}
