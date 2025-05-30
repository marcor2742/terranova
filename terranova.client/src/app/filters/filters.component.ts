import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Glass, Ingredient } from '../Classes/cocktail';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, map, distinctUntilChanged } from 'rxjs/operators';
import {
	IngredientSearch,
	IngredientSelectorComponent,
} from '../ingredient-selector/ingredient-selector.component';
import { GlassSelectorComponent } from '../glass-selector/glass-selector.component';
import { SearchFilters } from '../searchbar/searchbar.component';

import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { CategoriesService, Category } from '../services/categories.service';

@Component({
	selector: 'app-filters',
	standalone: true,
	imports: [
		ReactiveFormsModule,
		SelectButtonModule,
		DividerModule,
		CommonModule,
		TranslateModule,
		IngredientSelectorComponent,
		GlassSelectorComponent,
		InputTextModule,
		InputSwitchModule,
		MultiSelectModule,
	],
	templateUrl: './filters.component.html',
	styleUrl: './filters.component.scss',
})
export class FiltersComponent implements OnInit {
	private formBuilder = inject(FormBuilder);
	private categoriesService = inject(CategoriesService);

	filtersChanged = output<SearchFilters>();

	categories: Category[] = [];

	alcolOption = [
		{ label: 'All', value: 'NoPreference' }, // Or null,
		{ label: 'Alcoholic', value: 'Alcoholic' }, // Or true
		{ label: 'Non Alcoholic', value: 'NonAlcoholic' }, // Or false
	];
	filtersForm = this.formBuilder.group({
		Alcoholic: [
			'NoPreference' as 'Alcoholic' | 'NonAlcoholic' | 'NoPreference',
		],
		Glasses: new FormControl<Glass[]>([]),
		Ingredients: new FormControl<IngredientSearch[]>([]),
		Categories: new FormControl<Category[]>([]),
		AllIngredientsSwitch: [false],
		ShowOnlyOriginalSwitch: [false],
	});

	constructor() {}

	ngOnInit() {
		this.categoriesService.getCategories().subscribe({
			next: (categories) => {
				this.categories = categories;
				console.log('Categories loaded:', categories);
			},
			error: (error) => {
				console.error('Error loading categories:', error);
			},
		});

		this.filtersForm.valueChanges
			.pipe(
				debounceTime(350),
				distinctUntilChanged(
					(prev, curr) =>
						JSON.stringify(prev) === JSON.stringify(curr)
				),
				map((formValues) => {
					// Transform form data to SearchFilters structure
					const filters: SearchFilters = {
						SearchString: '',
						PageSize: 10,
						Page: 1,
						IsAlcoholic: formValues.Alcoholic ?? 'NoPreference',
						GlassNames:
							formValues.Glasses?.map((glass) => glass.name) ??
							[],
						Ingredients:
							formValues.Ingredients?.map((ing) => ing.name) ??
							[],
						Categories: formValues.Categories ?? [],
						Creators: [],
						AllIngredients: formValues.AllIngredientsSwitch
							? 'true'
							: 'false',
						ShowOnlyOriginal: formValues.ShowOnlyOriginalSwitch
							? 'true'
							: 'false',
					};
					return filters;
				})
			)
			.subscribe((transformedFilters) => {
				console.log(
					'FiltersComponent emitting transformed filters:',
					transformedFilters
				);
				this.filtersChanged.emit(transformedFilters);
			});
	}

	resetFilters() {
		this.filtersForm.reset({
			Alcoholic: 'NoPreference',
			Glasses: [],
			Ingredients: [],
			Categories: [],
			AllIngredientsSwitch: false,
			ShowOnlyOriginalSwitch: false,
		});
	}
}
