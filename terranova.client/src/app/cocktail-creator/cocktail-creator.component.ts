import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	FormControl,
	FormArray,
	Validators,
	ReactiveFormsModule,
	FormsModule,
} from '@angular/forms';

import { CategoriesService, Category } from '../services/categories.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GlassSelectorComponent } from '../glass-selector/glass-selector.component';
import { IngredientSelectorComponent } from '../ingredient-selector/ingredient-selector.component';
import { Cocktail, Ingredient } from '../Classes/cocktail';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DividerModule } from 'primeng/divider';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SettingsService } from '../services/setting-service.service';
import { CocktailModifierService } from '../services/cocktail-modifier.service';
import { Router } from '@angular/router';

/**
	 * {
		"name": "string",
		"category": "string",
		"iba": "string",
		"isAlcoholic": true,
		"imageUrl": "string",
		"imageSource": "string",
		"imageAttribution": "string",
		"tags": "string",
		"glassName": "string",
		"instructions": {
			"en": "string",
			"es": "string",
			"de": "string",
			"fr": "string",
			"it": "string"
		},
		"ingredients": [
			{
				"name": "string",
				"imperial": "string",
				"metric": "string"
			}
		]
	}*/
type CocktailCreator = {
	name: string;
	category: string;
	iba?: string;
	isAlcoholic: boolean;
	imageUrl?: string;
	imageSource?: string;
	imageAttribution?: string;
	tags?: string;
	glassName: string;
	instructions: {
		en?: string;
		es?: string;
		de?: string;
		fr?: string;
		it?: string;
	};
	ingredients: {
		name: string;
		imperial?: string;
		metric?: string;
	}[];
};

@Component({
	selector: 'app-cocktail-creator',
	imports: [
		CommonModule,
		GlassSelectorComponent,
		IngredientSelectorComponent,
		ReactiveFormsModule,
		FormsModule,
		SelectButtonModule,
		DividerModule,
		TranslateModule,
		InputTextModule,
		InputSwitchModule,
		MultiSelectModule,
		DropdownModule,
		TextareaModule,
		ButtonModule,
	],
	templateUrl: './cocktail-creator.component.html',
	styleUrl: './cocktail-creator.component.scss',
})
export class CocktailCreatorComponent implements OnInit {
	cocktailForm: FormGroup;
	ingredientMeasures: FormArray;
	categories: Category[] = [];

	// Current user preferences
	preferredMeasurementSystem = 'imperial'; // Default
	preferredLanguage = 'en'; // Default

	// Measurement systems
	measurementSystems = [
		{ label: 'Imperial (oz)', value: 'imperial' },
		{ label: 'Metric (ml)', value: 'metric' },
	];

	// Available languages
	availableLanguages = [
		{ label: 'English', value: 'en' },
		{ label: 'Italian', value: 'it' },
		// Add other languages as needed
	];

	alcolOption = [
		{ label: 'Alcoholic', value: 'Alcoholic' },
		{ label: 'Non Alcoholic', value: 'NonAlcoholic' },
	];

	constructor(
		private fb: FormBuilder,
		private categoriesService: CategoriesService,
		private settingsService: SettingsService,
		private cocktailModifierService: CocktailModifierService,
		private router: Router,
		private platformId: Object = inject(PLATFORM_ID)
	) {
		this.ingredientMeasures = this.fb.array([]);

		this.cocktailForm = this.fb.group({
			name: ['', Validators.required],
			Alcoholic: ['Alcoholic'],
			Category: [''],
			Glass: [''],
			Ingredients: [[]],
			Instructions: ['', Validators.required],
			ImageUrl: [''],
			ingredientMeasures: this.ingredientMeasures,
		});
	}

	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			// Load user preferences
			this.loadUserPreferences();
			this.loadCategories();

			// Watch for changes to ingredients and update measures array
			this.cocktailForm
				.get('Ingredients')
				?.valueChanges.subscribe((ingredients) => {
					this.updateIngredientMeasures(ingredients);
				});
		}
	}

	loadUserPreferences() {
		// Get user's preferred measurement system
		this.settingsService.getMeasurementSystem().subscribe((system) => {
			this.preferredMeasurementSystem = system || 'imperial';
			console.log(
				`Using ${this.preferredMeasurementSystem} measurement system`
			);
		});

		// Get user's preferred language
		this.settingsService.getLanguage().subscribe((language) => {
			this.preferredLanguage = language || 'en';
			console.log(`Using ${this.preferredLanguage} language`);
		});
	}

	loadCategories() {
		this.categoriesService.getCategories().subscribe((categories) => {
			this.categories = categories;
		});
	}

	// Update ingredient measures when ingredients change
	updateIngredientMeasures(ingredients: any[]) {
		this.ingredientMeasures.clear();

		if (ingredients && ingredients.length) {
			ingredients.forEach(() => {
				this.ingredientMeasures.push(
					this.fb.group({
						measurement: [''], // Single measurement field
					})
				);
			});
		}
	}

	// Get control for a specific ingredient measure
	getIngredientControl(index: number): FormControl {
		return this.ingredientMeasures
			.at(index)
			.get('measurement') as FormControl;
	}

	// Convert measurements between systems
	convertMeasurement(
		value: string,
		fromSystem: string,
		toSystem: string
	): string {
		if (!value || value.trim() === '') return '';

		// Extract numeric value and unit if possible
		const match = value.match(/^([\d.]+)\s*(\w+)?$/);
		if (!match) return value; // Can't parse, return as-is

		const numValue = parseFloat(match[1]);
		const unit = match[2]?.toLowerCase() || '';

		if (fromSystem === 'imperial' && toSystem === 'metric') {
			// Imperial to Metric conversions
			if (unit === 'oz' || unit === '') {
				return `${(numValue * 29.57).toFixed(0)} ml`;
			} else if (unit === 'tsp') {
				return `${(numValue * 5).toFixed(0)} ml`;
			} else if (unit === 'tbsp') {
				return `${(numValue * 15).toFixed(0)} ml`;
			}
		} else if (fromSystem === 'metric' && toSystem === 'imperial') {
			// Metric to Imperial conversions
			if (unit === 'ml' || unit === '') {
				return `${(numValue / 29.57).toFixed(1)} oz`;
			} else if (unit === 'cl') {
				return `${((numValue * 10) / 29.57).toFixed(1)} oz`;
			}
		}

		return value; // Default: return original
	}

	// When submitting, combine ingredients with their measurements
	sendCocktail() {
		if (this.cocktailForm.valid) {
			const formValue = this.cocktailForm.value;

			// Convert ingredients with appropriate measurements
			const ingredients = formValue.Ingredients.map(
				(ingredient: any, index: number) => {
					const measureValue =
						this.ingredientMeasures.at(index).get('measurement')
							?.value || '';

					// Create the ingredient with both measurement systems
					if (this.preferredMeasurementSystem === 'imperial') {
						return {
							name: ingredient.name,
							imperial: measureValue,
							metric: this.convertMeasurement(
								measureValue,
								'imperial',
								'metric'
							),
						};
					} else {
						return {
							name: ingredient.name,
							metric: measureValue,
							imperial: this.convertMeasurement(
								measureValue,
								'metric',
								'imperial'
							),
						};
					}
				}
			);

			// Create instructions object with all languages
			const instructions: Record<string, string> = {};

			// Set the user's preferred language
			instructions[this.preferredLanguage] = formValue.Instructions;

			// Prepare the cocktail data in the format expected by the API
			const cocktailData: CocktailCreator = {
				name: formValue.name,
				category: formValue.Category,
				isAlcoholic: formValue.Alcoholic === 'Alcoholic',
				glassName: formValue.Glass,
				imageUrl: formValue.ImageUrl || undefined,
				instructions: instructions,
				ingredients: ingredients,
			};

			console.log('Sending cocktail data:', cocktailData);

			// Call the API to create the cocktail
			this.cocktailModifierService
				.createCocktail(cocktailData)
				.subscribe({
					next: (response) => {
						console.log('Cocktail created successfully:', response);
						// Navigate to the new cocktail
						if (response && response.id) {
							this.router.navigate([
								`/home/cocktail/${response.id}`,
							]);
						}
					},
					error: (error) => {
						console.error('Error creating cocktail:', error);
						// Handle error (show message to user)
					},
				});
		}
	}

	resetForm() {
		this.cocktailForm.reset({
			Alcoholic: 'Alcoholic',
		});
		this.ingredientMeasures.clear();
	}
}
