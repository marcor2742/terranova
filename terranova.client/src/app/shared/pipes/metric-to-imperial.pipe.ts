import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'metricToImperial',
  standalone: true
})
export class MetricToImperialPipe implements PipeTransform {
  // Conversion factors
  private readonly conversions = {
    'ml': { unit: 'fl oz', factor: 0.033814 },
    'cl': { unit: 'fl oz', factor: 0.33814 },
	"cc": { unit: 'fl oz', factor: 0.033814 },
    'l': { unit: 'qt', factor: 1.05669 },
    'g': { unit: 'oz', factor: 0.035274 },
    'kg': { unit: 'lb', factor: 2.20462 },
    'cm': { unit: 'in', factor: 0.393701 },
    'm': { unit: 'ft', factor: 3.28084 }
  };

  // Imperial-using locales
  private readonly imperialLocales = ['en-US', 'en-GB'];

  transform(
    value: number, 
    unit: string, 
    locale: string = document.documentElement.lang || 'en-US',
    keepOriginal: boolean = false
  ): string {
    // Only convert for imperial-using locales
    if (!this.imperialLocales.includes(locale)) {
      return `${this.formatNumber(value, locale)} ${unit}`;
    }

    // Get conversion info for this unit
    const conversion:string = this.conversions[unit.toLowerCase()];
    
    // If we don't have conversion info or explicitly want to keep original
    if (!conversion || keepOriginal) {
      return `${this.formatNumber(value, locale)} ${unit}`;
    }

    // Calculate converted value
    const convertedValue = value * conversion.factor;
    
    // Format based on locale and value size
    const formattedValue = this.formatNumber(convertedValue, locale);
    
    // Return formatted string with unit
    return `${formattedValue} ${conversion.unit}`;
  }

  private formatNumber(value: number, locale: string): string {
    // Small values get more decimal places
    const decimals = value < 1 ? 2 : (value < 10 ? 1 : 0);
    return new Intl.NumberFormat(locale, { 
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    }).format(value);
  }
}