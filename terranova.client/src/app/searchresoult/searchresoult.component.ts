import { Component, input, output, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { CockResoults, Cocktail } from '../Classes/cocktail';
import { TranslateModule } from '@ngx-translate/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface Searchres {
    id: number;
    add: "add" | "only";
}

/**
 * Component for displaying a single cocktail search result
 * Renders cocktail information with different size options
 */
@Component({
    selector: 'app-searchresoult',
    imports: [MatListModule, SelectButtonModule, TranslateModule, CommonModule],
    templateUrl: './searchresoult.component.html',
    styleUrl: './searchresoult.component.scss',
})
export class SearchresoultComponent implements OnInit {
    /**
     * Controls the size of the displayed result
     * Can be 'small', 'medium', or 'large'
     */
    readonly ResoultSize = input<CockResoults>('small');

    /**
     * The cocktail data to display
     */
    readonly Cocktail = input.required<Cocktail>();

    readonly CocktailAlreadySelected = input<boolean>(false);

    readonly cocktailSelected = output<Searchres>();
    
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
    
    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            console.log('[SearchResult] , Cocktail:', this.Cocktail());
        }
    }

    navigateToCocktail(Searchres: Searchres) {
        console.log('Cocktail selected:', Searchres);
        this.cocktailSelected.emit(Searchres);
    }

}