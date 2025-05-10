import { Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
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
import { MessageService } from 'primeng/api';
import {
	FileUploadModule,
	FileUploadHandlerEvent,
	FileUploadErrorEvent,
} from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import {
	FileManagementService,
	UploadResponse,
} from '../services/file-management.service'; // Import the service
import { environment } from '../../environments/environment'; // For upload URL

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

interface UploadFile extends File {
	objectURL?: string;
}

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
		FileUploadModule,
		ToastModule,
		ProgressBarModule,
		BadgeModule,
	],
	templateUrl: './cocktail-creator.component.html',
	styleUrl: './cocktail-creator.component.scss',
	providers: [MessageService],
	standalone: true,
})
export class CocktailCreatorComponent implements OnInit {
	cocktailForm: FormGroup;
	ingredientMeasures: FormArray;
	categories: Category[] = [];

	fileUploadUrl = environment.cocktailImgUploadUrl; // URL for file upload
	uploadResponse: UploadResponse | null = null; // Response from the upload service
	uploadedImageUrl: string = ''; // URL of the uploaded image

	// uploadedFiles: any[] = [];
	filesToUpload: UploadFile[] = [];
	totalSize: number = 0;
	totalSizePercent: number = 0;

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
		@Inject(PLATFORM_ID) private platformId: Object,
		private messageService: MessageService // private fileManagementService: FileManagementService
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

	inBrowser() {
		return isPlatformBrowser(this.platformId);
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
		if (!isPlatformBrowser(this.platformId)) return;
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
		if (!isPlatformBrowser(this.platformId)) return;

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
		if (!isPlatformBrowser(this.platformId)) return;
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

	onSelectFiles(event: any): void {
    if (!event) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid file selection event'
        });
        return;
    }

    // PrimeNG's FileUpload component puts the actual files in currentFiles
    if (!event.currentFiles || !Array.isArray(event.currentFiles) || event.currentFiles.length === 0) {
        this.messageService.add({
            severity: 'warn',
            summary: 'No Files',
            detail: 'No files were selected'
        });
        return;
    }

    // Only use the first file since we only want single file uploads
    const file = event.currentFiles[0];
    this.filesToUpload = [file];
    this.totalSize = file.size || 0;
    this.totalSizePercent = 0; // Reset progress

    this.messageService.add({
        severity: 'info',
        summary: 'File Selected',
        detail: `"${file.name}" ready to upload`
    });
}

	onRemoveTemplatingFile(
		file: UploadFile,
		removeFileCallback: Function,
		index: number
	): void {
		if (typeof removeFileCallback !== 'function') {
			console.error('removeFileCallback is not a function');
			return;
		}

		removeFileCallback(index);

		if (!Array.isArray(this.filesToUpload)) {
			this.filesToUpload = [];
			return;
		}

		this.filesToUpload = this.filesToUpload.filter((f, i) => i !== index);
		this.totalSize = 0;

		if (this.filesToUpload.length > 0) {
			this.filesToUpload.forEach((f_) => {
				if (f_ && f_.size) {
					this.totalSize += f_.size;
				}
			});
		} else {
			this.totalSizePercent = 0;
		}
	}

	onClearTemplatingUpload(clearCallback: Function): void {
		if (typeof clearCallback === 'function') {
			clearCallback();
		}
		this.filesToUpload = [];
		this.totalSize = 0;
		this.totalSizePercent = 0;
	}

	// This method will be triggered by the template's upload button
	initiateUpload(uploadCallback: Function): void {
		if (!isPlatformBrowser(this.platformId)) return;

		if (this.filesToUpload.length > 0) {
			// PrimeNG's FileUpload component will handle the actual upload if `url` is set
			// and `customUpload` is false. The `uploadCallback()` triggers its internal mechanism.
			uploadCallback();
		} else {
			this.messageService.add({
				severity: 'warn',
				summary: 'No file selected',
				detail: 'Please select a file to upload.',
			});
		}
	}

	// This is called by p-fileupload after its internal upload mechanism completes
	onImageUploadSuccess(event: { originalEvent: any; files: File[] }): void {
		if (!isPlatformBrowser(this.platformId)) return;

		const response = event.originalEvent.body; // Or event.originalEvent.target.response if using XHR directly
		if (response && response.url) {
			// Assuming server returns { "url": "..." }
			this.uploadedImageUrl = response.url;
			this.cocktailForm.patchValue({ ImageUrl: this.uploadedImageUrl });
			this.messageService.add({
				severity: 'info',
				summary: 'Success',
				detail: 'File Uploaded',
			});

			// Add to uploadedFiles for display in template if needed
			event.files.forEach((file) => {
				// To display in "Completed" section, you might need to adapt how `uploadedFiles` is populated
				// For a single image, you might not need a list of `uploadedFiles` in the UI
				// and just rely on `uploadedImageUrl`
			});
			this.filesToUpload = []; // Clear pending files
			this.totalSize = 0;
			this.totalSizePercent = 100; // Mark as complete
		} else {
			this.messageService.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Could not get image URL from response.',
			});
			this.totalSizePercent = 0;
		}
	}

	onUploadError(event: FileUploadErrorEvent): void {
		if (!isPlatformBrowser(this.platformId)) return;
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: 'File upload failed.',
		});
		console.error('Upload error:', event);
		this.totalSizePercent = 0;
	}

	onProgress(event: { progress: number }): void {
		if (!isPlatformBrowser(this.platformId)) return;

		this.totalSizePercent = event.progress;
	}

	choose(event: Event, callback: Function): void {
		callback();
	}

	formatSize(bytes: number): string {
		const k = 1024;
		const dm = 2;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		if (bytes === 0) {
			return '0 B';
		}
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return (
			parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
		);
	}
}
