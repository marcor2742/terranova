import { Pipe, PipeTransform } from '@angular/core';
import { Cocktail, Instructions } from '../Classes/cocktail';
import { SettingsService } from '../services/setting-service.service';

@Pipe({
	name: 'instructions',
	standalone: true,
})
export class InstructionsPipe implements PipeTransform {
	constructor(private settingsService: SettingsService) {}

	transform(cocktail: Cocktail): string {
		if (!cocktail) return '';

		// Use the synchronous method instead of the observable one
		const language = this.settingsService.getCurrentLanguage();

		if (typeof cocktail.instructions === 'string') {
			return cocktail.instructions;
		} else if (
			cocktail.instructions &&
			typeof cocktail.instructions === 'object'
		) {
			// Use a type assertion to help TypeScript recognize this as a valid access
			const instructions = cocktail.instructions as Instructions;
			return (
				(language in instructions ? instructions[language as keyof Instructions] : null) ||
				instructions.en ||
				''
			);
		}

		return '';
	}
}
