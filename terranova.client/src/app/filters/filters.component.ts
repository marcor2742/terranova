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
	],
	templateUrl: './filters.component.html',
	styleUrl: './filters.component.scss',
})
export class FiltersComponent implements OnInit {
	private formBuilder = inject(FormBuilder);

	filtersChanged = output<SearchFilters>();
	alcolOption = [
		// Keep 'NoPreference' value consistent with SearchFilters default if needed
		{ label: 'All', value: 'NoPreference' }, // Or null, depending on API/SearchFilters
		{ label: 'Alcoholic', value: 'Alcoholic' }, // Or true
		{ label: 'Non Alcoholic', value: 'NonAlcoholic' }, // Or false
	];
	filtersForm = this.formBuilder.group({
		// Adjust initial value based on alcolOption values
		Alcoholic: [
			'NoPreference' as 'Alcoholic' | 'NonAlcoholic' | 'NoPreference',
		],
		Glasses: new FormControl<Glass[]>([]),
		// Use IngredientSearch if that's what the selector provides
		Ingredients: new FormControl<IngredientSearch[]>([]),
		Category: [''],
		AllIngredientsSwitch: [false],
		ShowOnlyOriginalSwitch: [false],
	});
	constructor() {}

	ngOnInit() {
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
						Category: formValues.Category ?? '',
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
            Category: '',
            // Reset the boolean switch controls
            AllIngredientsSwitch: false,
            ShowOnlyOriginalSwitch: false
		});
	}
}
