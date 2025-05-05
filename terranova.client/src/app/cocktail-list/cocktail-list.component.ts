import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollerModule } from 'primeng/scroller';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { CocktailCardComponent } from '../cocktail-card/cocktail-card.component';
import { Cocktail } from '../Classes/cocktail';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '../services/state-service.service';

@Component({
  selector: 'app-cocktail-list',
  imports: [CommonModule, TranslateModule, ScrollerModule, DividerModule, SkeletonModule, CocktailCardComponent],
  templateUrl: './cocktail-list.component.html',
  styleUrl: './cocktail-list.component.scss'
})
export class CocktailListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private stateService = inject(StateService);
  
  // Keep existing inputs/outputs
  close = output<string>();
  searchOrList = input<string>('search');
  cockTailList = input<number[]>([]);
  removeCock = output<number>();
  
  searchTerm: string = '';
  displayedCocktails: number[] = [];
  
  ngOnInit() {
    // Subscribe to StateService for cocktails
    this.stateService.selectedCocktails$.subscribe(cocktails => {
      // Update our local display list if we have state cocktails
      if (cocktails && cocktails.length > 0) {
        this.displayedCocktails = cocktails;
        console.log('CocktailList: Updated from state service:', cocktails);
      }
    });
    
    // Subscribe to search results
    this.stateService.searchResults$.subscribe(results => {
      if (results && results.length > 0) {
        // Extract IDs from the cocktail objects
        const cocktailIds = results.map(cocktail => cocktail.id);
        this.displayedCocktails = cocktailIds;
        console.log('CocktailList: Updated from search results:', cocktailIds);
      }
    });
    
    // Read route parameters
    this.route.params.subscribe(params => {
      if (params['term']) {
        this.searchTerm = params['term'];
        console.log('Search term from route:', this.searchTerm);
        
        // // If we're on the search route, set the list mode
        // if (this.route.snapshot.url[0]?.path === 'search') {
        //   this.searchOrList.set('search');
        // }
      }
    });
  }
  
  removeCocktail(cocktailId: number) {
    this.removeCock.emit(cocktailId);
    
    // Also update the state service
    const updatedCocktails = this.displayedCocktails.filter(id => id !== cocktailId);
    this.stateService.updateSelectedCocktails(updatedCocktails);
  }
}