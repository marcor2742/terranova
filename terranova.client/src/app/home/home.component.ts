import { Component, inject, signal, ViewEncapsulation, OnDestroy } from '@angular/core';
import { SearchbarComponent, SearchFilters } from '../searchbar/searchbar.component';
import { NavigationEnd, RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CommonModule } from '@angular/common';
import { ScrollerModule } from 'primeng/scroller';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FiltersComponent } from '../filters/filters.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StateService } from '../services/state-service.service';
import { filter } from 'rxjs';
import { Subscription } from 'rxjs';
import { Searchres } from '../searchresoult/searchresoult.component';

// PrimeNG imports
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from 'primeng/api';

/**
 * Main home component of the application
 * Displays the home page with sidebar navigation and theme toggling
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SearchbarComponent,
    CommonModule,
    ScrollerModule,
    DividerModule,
    SkeletonModule,
    ButtonModule,
    ToolbarModule,
    SelectButtonModule,
    TranslateModule,
    FiltersComponent,
    ReactiveFormsModule,
    RouterModule,
    SidebarModule,
    PanelMenuModule,
    TabMenuModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private stateService = inject(StateService);
  private route = inject(ActivatedRoute);
  themeService = inject(ThemeService);
  
  // Track all subscriptions
  private subscriptions = new Subscription();

  // Sidebar state
  sidebarVisible = signal<boolean>(true);
  menuItems: MenuItem[] = [];
  tabItems: MenuItem[] = [];
  activeTabItem: MenuItem | undefined;
  sidebarForm = this.fb.group({
    sidebarMode: ['navigation'],
  });

  // Application state
  activeFilters = signal<SearchFilters>({
    SearchString: '',
    PageSize: 10,
    Page: 1,
    IsAlcoholic: 'NoPreference',
    GlassNames: [],
    Creators: [],
    Category: '',
    Ingredients: [],
    AllIngredients: 'false',
    ShowOnlyOriginal: 'false',
  });
  selectedCocktails = signal<number[]>([]);
  showCocktailDetails = signal<boolean>(false);
  searchModeActive = signal<boolean>(false);
  currentSearchTerm = signal<string>('');
  searchMode = signal<string>('dropdown');
  activeView = signal<
    'home' | 'settings' | 'dashboard' | 'cocktails' | 'favorites' | 'search'
  >('home');

  constructor() {
    // Subscribe to state service
    this.subscriptions.add(
      this.stateService.selectedCocktails$.subscribe((cocktails) => {
        if (cocktails) this.selectedCocktails.set(cocktails);
      })
    );
    
    this.subscriptions.add(
      this.stateService.filters$.subscribe((filters) => {
        if (filters) this.activeFilters.set(filters);
      })
    );
    
    // Listen to route changes
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(() => {
          const urlSegments = this.router.url.split('/');
          const currentSegment = urlSegments[urlSegments.length - 1];

          if (currentSegment.startsWith('search')) {
            this.activeView.set('search');
            
            // Extract search term from URL if available
            const searchTermMatch = currentSegment.match(/search\/(.+)/);
            if (searchTermMatch && searchTermMatch[1]) {
              this.currentSearchTerm.set(decodeURIComponent(searchTermMatch[1]));
            }
          } else if (
            ['dashboard', 'settings', 'cocktails', 'favorites'].includes(currentSegment)
          ) {
            this.activeView.set(currentSegment as any);
          }
        })
    );

    this.initMenuItems();
    this.initTabItems();
  }

  ngOnDestroy() {
    // Clean up all subscriptions
    this.subscriptions.unsubscribe();
  }

  /**
   * Initialize panel menu items for sidebar navigation
   */
  initMenuItems() {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        command: () => this.setActiveView('dashboard'),
        expanded: this.activeView() === 'dashboard',
      },
      {
        label: 'Cocktail List',
        icon: 'pi pi-list',
        command: () => this.setActiveView('cocktails'),
        expanded: this.activeView() === 'cocktails',
      },
      {
        label: 'Favorites',
        icon: 'pi pi-heart',
        command: () => this.setActiveView('favorites'),
        expanded: this.activeView() === 'favorites',
      },
      {
        label: `Search: "${this.currentSearchTerm()}"`,
        icon: 'pi pi-search',
        command: () => this.goToSearch(),
        expanded: this.activeView() === 'search',
        visible: !!this.currentSearchTerm(),
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        command: () => this.setActiveView('settings'),
        expanded: this.activeView() === 'settings',
      },
    ];
  }

  /**
   * Initialize tab menu items for sidebar mode switching
   */
  initTabItems() {
    this.tabItems = [
      {
        label: 'Menu',
        icon: 'pi pi-bars',
        command: () => this.setSidebarMode('navigation'),
      },
      {
        label: 'Filters',
        icon: 'pi pi-filter',
        command: () => this.setSidebarMode('filters'),
      },
    ];
    this.activeTabItem = this.tabItems[0];
  }

  /**
   * Set sidebar mode and update active tab
   */
  setSidebarMode(mode: 'navigation' | 'filters') {
    this.sidebarForm.get('sidebarMode')?.setValue(mode);
    this.activeTabItem = this.tabItems.find(
      (item) =>
        (mode === 'navigation' && item.icon === 'pi pi-bars') ||
        (mode === 'filters' && item.icon === 'pi pi-filter')
    );
  }

  /**
   * Toggles the sidebar between expanded and collapsed states
   */
  toggleSidebar() {
    this.sidebarVisible.update((val) => !val);
  }

  /**
   * Toggles between light and dark theme
   */
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  /**
   * Sets the active view in the content area and navigates to it
   */
  setActiveView(
    view: 'home' | 'settings' | 'dashboard' | 'cocktails' | 'favorites' | 'search'
  ) {
    this.activeView.set(view);
    this.router.navigate([view], { relativeTo: this.route });
  }

  /**
   * Adds or replaces cocktails in the selection and navigates to cocktail list
   */
  modifySelectedCocktails(search: Searchres) {
    let updatedCocktails = [...this.selectedCocktails()];

    if (search.add === 'add') {
      if (!updatedCocktails.includes(search.id)) {
        updatedCocktails.push(search.id);
      }
    } else if (search.add === 'only') {
      updatedCocktails = [search.id];
    }

    this.selectedCocktails.set(updatedCocktails);
    this.stateService.updateSelectedCocktails(updatedCocktails);

    // Only navigate if not already on the cocktails page
    if (this.router.url !== '/home/cocktails') {
      this.router.navigate(['cocktails'], { relativeTo: this.route });
    }
  }

  /**
   * Handle full search request and navigate to search results
   */
  handleFullSearch(event: {
    searchString: string;
    cocktails: any[];
    page: number;
  }) {
    if (!event.searchString || event.searchString.trim().length === 0) {
      console.warn('Empty search string, not navigating');
      return;
    }

    // Update UI state
    this.currentSearchTerm.set(event.searchString);
    this.searchModeActive.set(true);
    this.sidebarForm.get('sidebarMode')?.setValue('filters');
    this.activeView.set('search');
    this.searchMode.set('full');

    // Update filters
    const updatedFilters = {
      ...this.activeFilters(),
      SearchString: event.searchString,
      Page: event.page || 1,
    };
    this.activeFilters.set(updatedFilters);
    this.stateService.updateFilters(updatedFilters);

    // Update cocktail selection
    if (event.cocktails && event.cocktails.length > 0) {
      const cocktailIds = event.cocktails.map((cocktail) => cocktail.id);
      this.selectedCocktails.set(cocktailIds);
      this.stateService.updateSelectedCocktails(cocktailIds);
    }

    // Update search results
    this.stateService.updateSearchResults(event.cocktails);

    // Navigate to search results
    this.router.navigate(['search', event.searchString], {
      relativeTo: this.route,
    });

    console.log(
      `Navigating to search with ${event.cocktails.length} results for "${event.searchString}"`
    );
  }

  /**
   * Close cocktail details and reset selection
   */
  closeCocktailDetails() {
    this.showCocktailDetails.set(false);
    this.selectedCocktails.set([]);
    this.activeView.set('home');
  }

  /**
   * Navigate to search results with current search term
   */
  goToSearch() {
    if (this.currentSearchTerm()) {
      this.activeView.set('search');
      this.router.navigate(['search', this.currentSearchTerm()], {
        relativeTo: this.route,
      });
    }
  }

  /**
   * Update filters while preserving search term and navigate if needed
   */
  pushFilters(filters: SearchFilters) {
    const currentSearchTerm = this.activeFilters().SearchString;
    const updatedFilters = {
      ...filters,
      SearchString: currentSearchTerm || filters.SearchString,
    };

    this.activeFilters.set(updatedFilters);
    this.stateService.updateFilters(updatedFilters);
    this.searchMode.set('full');

    if (updatedFilters.SearchString) {
      this.router.navigate(['search', updatedFilters.SearchString], {
        relativeTo: this.route,
      });
    }
  }
}