import { Injectable, inject } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private primengConfig = inject(PrimeNGConfig);

  registerIcons() {
    // Register custom SVG icons
    this.primengConfig.ripple = true;
    
    this.primengConfig.setIconRegistry([
      {
        name: 'cocktail-wine',
        svg: './assets/icons/cocktail-wine.svg'
      },
      {
        name: 'cocktail-glass',
        svg: './assets/icons/cocktail-glass.svg'
      },
      {
        name: 'cocktail-nonalcoholic',
        svg: './assets/icons/cocktail-nonalcoholic.svg'
      },
      {
        name: 'cocktail-optional',
        svg: './assets/icons/cocktail-optional.svg'
      }
    ]);
    
    console.log('Custom icons registered');
  }
}