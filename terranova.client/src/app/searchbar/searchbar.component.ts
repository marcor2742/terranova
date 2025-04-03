import { Component, input, Resource, signal, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { SearchresoultComponent } from '../searchresoult/searchresoult.component';
import { CockResoults, Cocktail, ingredient } from '../Classes/cocktail';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { httpResource } from '@angular/common/http';

@Component({
  selector: 'app-searchbar',
  imports: [
    SearchresoultComponent,
    MatDividerModule,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.scss',
})
export class SearchbarComponent implements OnInit {
  searchParams = signal<string>('');
  ResoultSize = input<CockResoults>('small');
  MaxResoults = input<number>(5);
  searchUrl = environment.searchUrl;

  // Create a FormGroup using FormBuilder
  searchForm: FormGroup;
  
  SearchResource: Resource<Cocktail[]> = httpResource(
    () => ({
      url: 'https://my-json-server.typicode.com/Bombatomica64/randomjson/cocktails',
      method: 'GET',
      params: { search: this.searchParams(), max: this.MaxResoults() },
    }),
    {
      defaultValue: [
        new Cocktail(
          1,
          'Mojito',
          'A refreshing Cuban cocktail with rum, mint, and lime.',
          [
            new ingredient('White rum', 60, 'ml'),
            new ingredient('Fresh lime juice', 30, 'ml'),
            new ingredient('Sugar', 2, 'tsp'),
            new ingredient('Mint leaves', 8, 'oz'),
            new ingredient('Soda water', 100, 'ml'),
          ],
          'Mix all ingredients in a glass and stir well.',
          'https://example.com/mojito.jpg'
        ),
        new Cocktail(
          2,
          'Daiquiri',
          'A classic cocktail made with rum, lime juice, and sugar.',
          [
            new ingredient('White rum', 50, 'ml'),
            new ingredient('Fresh lime juice', 25, 'ml'),
            new ingredient('Sugar', 1, 'tsp'),
          ],
          'Simplify by shaking all ingredients with ice and straining into a chilled glass.',
          'https://example.com/daiquiri.jpg'
        ),
      ],
    }
  );
  
  constructor(private fb: FormBuilder) {
    // Initialize form
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
    
    console.log('SearchbarComponent initialized');
  }

  ngOnInit() {
    // Subscribe to form value changes
    this.searchForm.get('searchTerm')?.valueChanges.subscribe((value) => {
      console.log('Search term changed:', value);
      this.searchParams.set(value || '');
    });
  }
}