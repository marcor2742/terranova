import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/setting-service.service';

@Pipe({
  name: 'measurement',
  standalone: true,
})
export class MeasurementPipe implements PipeTransform {
  constructor(private settingsService: SettingsService) {}

  transform(value: any): string {
    if (!value) return '';

    // Use the synchronous method, not the Observable method
    const preferredUnit = this.settingsService.getCurrentMeasurementSystem();

    // Now the comparison will work correctly
    return preferredUnit === 'metric'
      ? this.formatMetric(value)
      : this.formatImperial(value);
  }

  private formatMetric(value: any): string {
    // Your metric formatting logic
    return `${value.metric || ''}`;
  }

  private formatImperial(value: any): string {
    // Your imperial formatting logic
    return `${value.imperial || ''}`;
  }
}