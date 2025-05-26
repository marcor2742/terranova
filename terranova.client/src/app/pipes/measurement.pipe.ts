import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/setting-service.service';
import { Ingredient, MeasureUnit } from '../Classes/cocktail';

@Pipe({
	name: 'measurement',
	standalone: true,
})
export class MeasurementPipe implements PipeTransform {
	constructor(private settingsService: SettingsService) { }

	transform(value: any): string {
		if (!value) return '';

		const preferredUnit:MeasureUnit | undefined = this.settingsService.getCurrentMeasurementSystem();

		if (typeof preferredUnit === 'undefined') {
			return value.getMeasure('metric'); // Default to metric if no preferred unit is set
		}

		// Se è un oggetto Ingredient, usa il suo metodo toString
		if (value) {
			return preferredUnit === 'metric' ? value.metricMeasure : value.imperialMeasure;
		}

		// Fallback: restituisci come stringa
		return value.toString();
	}
}
