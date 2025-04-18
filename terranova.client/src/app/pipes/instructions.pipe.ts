import { Pipe, PipeTransform } from '@angular/core';
import { Cocktail, Instructions } from '../Classes/cocktail';
import { SettingsService } from '../services/setting-service.service';

@Pipe({
  name: 'instructions',
  standalone: true
})
export class InstructionsPipe implements PipeTransform {
  constructor(private settingsService: SettingsService) {}

  transform(cocktail: Cocktail): string {
    if (!cocktail) return '';
    
    const language = this.settingsService.getSetting('language');
    
    if (typeof cocktail.instructions === 'string') {
      return cocktail.instructions;
    } else if (cocktail.instructions && typeof cocktail.instructions === 'object') {
      return cocktail.instructions[language] || 
             cocktail.instructions['en'] || 
             '';
    }
    
    return '';
  }
}