import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Glass } from '../Classes/cocktail';
import { GlassService } from '../services/glass.service';
import { SelectButtonModule } from 'primeng/selectbutton';
@Component({
  selector: 'app-filters',
  imports: [ReactiveFormsModule, SelectButtonModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {

	private formBuilder = inject(FormBuilder);
	private glassService = inject(GlassService);

	glasses: Glass[] = []
	alcolOption = [
		{ label: 'Alcoholic', value: true },
		{ label: 'Non Alcoholic', value: false }
	]

	previousSearch = input<string>('');

	filtersForm = this.formBuilder.group({
		alcoholic: [true as boolean],
		glassType: ['']
	});
	constructor() {
		this.filtersForm = this.formBuilder.group({
			alcoholic: true,
			glassType: ['']
		});
	}

	getGlasses() {
		// Fetch glasses from the service
		this.glassService.getGlasses().subscribe((data: Glass[]) => {
			this.glasses = data;
		});
	}

}
