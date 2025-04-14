import { isPlatformBrowser } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'selected-theme';
  private readonly DARK_THEME = 'dark-theme';
  private readonly SUMMER_THEME = 'summer-theme';
  
  // Don't initialize the signal at class level
  private _currentTheme?: ReturnType<typeof signal<string>>;
  private initialized = false;
  private _activeTheme = this.DARK_THEME;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this._currentTheme = signal<string>(this.DARK_THEME);
      this.loadSavedTheme();
    }
  }
  
  private loadSavedTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem(this.THEME_KEY) || this.DARK_THEME;
      this.setTheme(savedTheme);
    }
  }
  
  setTheme(theme: string): void {
    this._activeTheme = theme;
    
    if (isPlatformBrowser(this.platformId) && this._currentTheme) {
      this._currentTheme.set(theme);
      document.body.classList.remove(this.DARK_THEME, this.SUMMER_THEME);
      
      if (theme === this.SUMMER_THEME) {
        document.body.classList.add(this.SUMMER_THEME);
      }
      
      localStorage.setItem(this.THEME_KEY, theme);
      this.initialized = true;
      
      document.body.style.display = 'none';
      void document.body.offsetHeight;
      document.body.style.display = '';
    }
  }
  
  getCurrentTheme(): string {
    return this._activeTheme;
  }
  
  toggleTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      const newTheme = this._activeTheme === this.DARK_THEME 
        ? this.SUMMER_THEME 
        : this.DARK_THEME;
      this.setTheme(newTheme);
    }
  }
  
  isDarkTheme(): boolean {
    return this._activeTheme === this.DARK_THEME;
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
}

// import { isPlatformBrowser } from '@angular/common';
// import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class ThemeService {
//   private readonly THEME_KEY = 'selected-theme';
//   private readonly DARK_THEME = 'dark-theme';
//   private readonly SUMMER_THEME = 'summer-theme';
  
//   // Don't initialize the signal at class level
//   private _currentTheme?: ReturnType<typeof signal<string>>;
//   private initialized = false;
//   private _activeTheme = this.DARK_THEME;
  
//   constructor(@Inject(PLATFORM_ID) private platformId: Object) {
//     if (isPlatformBrowser(this.platformId)) {
//       this._currentTheme = signal<string>(this.DARK_THEME);
//       this.loadSavedTheme();
//     }
//   }
  
//   private loadSavedTheme(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       const savedTheme = localStorage.getItem(this.THEME_KEY) || this.DARK_THEME;
//       this.setTheme(savedTheme);
//     }
//   }
  
//   setTheme(theme: string): void {
//     this._activeTheme = theme;
    
//     if (isPlatformBrowser(this.platformId) && this._currentTheme) {
//       this._currentTheme.set(theme);
//       document.body.classList.remove(this.DARK_THEME, this.SUMMER_THEME);
      
//       if (theme === this.SUMMER_THEME) {
//         document.body.classList.add(this.SUMMER_THEME);
//       }
      
//       localStorage.setItem(this.THEME_KEY, theme);
//       this.initialized = true;
      
//       document.body.style.display = 'none';
//       void document.body.offsetHeight;
//       document.body.style.display = '';
//     }
//   }
  
//   getCurrentTheme(): string {
//     return this._activeTheme;
//   }
  
//   toggleTheme(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       const newTheme = this._activeTheme === this.DARK_THEME 
//         ? this.SUMMER_THEME 
//         : this.DARK_THEME;
//       this.setTheme(newTheme);
//     }
//   }
  
//   isDarkTheme(): boolean {
//     return this._activeTheme === this.DARK_THEME;
//   }
  
//   isInitialized(): boolean {
//     return this.initialized;
//   }
// }