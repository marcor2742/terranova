import { Pipe, PipeTransform } from '@angular/core';
import { Ingredient } from '../Classes/cocktail';
import { SettingsService } from '../services/setting-service.service';

@Pipe({
  name: 'measurement',
  standalone: true
})
export class MeasurementPipe implements PipeTransform {
  constructor(private settingsService: SettingsService) {}

  transform(ingredient: Ingredient): string {
    if (!ingredient) return '';
    
    // Get user preference from settings service
    const preferredUnit = this.settingsService.getSetting('locale');
    
    // Access properties directly instead of calling a method
    return preferredUnit === 'metric' ? 
           ingredient.metricMeasure : 
           ingredient.imperialMeasure;
  }
}