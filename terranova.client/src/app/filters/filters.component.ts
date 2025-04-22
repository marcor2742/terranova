import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Glass, Ingredient } from '../Classes/cocktail';
import { GlassService } from '../services/glass.service';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    SelectButtonModule, 
    MultiSelectModule,
    DividerModule,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private glassService = inject(GlassService);
  private http = inject(HttpClient);

  // Inputs and outputs
  searchTerm = input<string>('');
  previousSearch = input<string>('');
  filtersChanged = output<any>();

  // Form data
  glasses: Glass[] = [];
  ingredients: Ingredient[] = [];
  filteredIngredients: Ingredient[] = [];
  
  // Selection options
  alcolOption = [
    { label: 'All', value: null },
    { label: 'Alcoholic', value: true },
    { label: 'Non Alcoholic', value: false }
  ];

  // Form definition
  filtersForm = this.formBuilder.group({
    Alcoholic: [null as boolean | null],
    Glasses: [[] as Glass[]],
    Ingredients: [[] as Ingredient[]]
  });

  constructor() {
    // Form initialization moved to ngOnInit
  }

  ngOnInit() {

    // Load glasses on init
    this.getGlasses();
    
    // Subscribe to form changes
    this.filtersForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(values => {
      console.log('Filter values changed:', values);
      this.filtersChanged.emit(values);
    });
    
    // Set search term if provided
    if (this.previousSearch()) {
      this.searchIngredients(this.previousSearch());
    }
  }

  getGlasses() {
    this.glassService.getGlasses().subscribe((data: Glass[]) => {
      this.glasses = data;
      console.log('Glasses loaded:', this.glasses);
    });
  }

  searchIngredients(event: any) {
    // If event has query property (from MultiSelect filter), use that
    const query = typeof event === 'string' ? event : event.query;
    
    // Use the API to search for ingredients
    if (query && query.length > 1) {
      this.http.get<Ingredient[]>(`${environment.ingredientUrl}?q=${query}`).subscribe(
        data => {
          this.filteredIngredients = data;
        },
        error => {
          console.error('Error searching ingredients:', error);
          this.filteredIngredients = [];
        }
      );
    } else {
      this.filteredIngredients = [];
    }
  }

  resetFilters() {
    this.filtersForm.reset({
      Alcoholic: null,
      Glasses: [],
      Ingredients: []
    });
  }
}