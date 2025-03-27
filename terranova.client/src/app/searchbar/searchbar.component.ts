import { httpResource } from '@angular/common/http';
import { Component, input, Resource, signal } from '@angular/core';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { environment } from '../../environments/environment';
import { SearchresoultComponent } from '../searchresoult/searchresoult.component';
import { CockResoults, Cocktail } from '../Classes/cocktail';
@Component({
	selector: 'app-searchbar',
	imports: [HlmInputDirective, SearchresoultComponent],
	templateUrl: './searchbar.component.html',
	styleUrl: './searchbar.component.scss',
})
export class SearchbarComponent {
	searchParams = signal<string>('');
	ResoultSize = input<CockResoults>('small');
	MaxResoults = input<number>(5);
	searchUrl = environment.searchUrl;
	// SearchResource = httpResource(() => ({url: `${this.searchUrl}?search=${this.searchParams}&max=${this.MaxResoults}`}));
	SearchResource: Resource<Cocktail[] | undefined> = httpResource(() => ({
		url: `${this.searchUrl}?search=${this.searchParams}&max=${this.MaxResoults}`,
		method: 'GET',
		params: { search: this.searchParams(), max: this.MaxResoults() },
	}));
}
