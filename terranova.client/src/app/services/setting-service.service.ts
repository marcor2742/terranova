import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, of, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service'; // You'll need to add this dependency

export interface UserSettings {
  theme: string;
  language: 'en' | 'fr' | 'es' | 'de' | 'it';
  notifications: boolean;
  searchPreference: 'original' | 'friend' | 'all';
  locale: 'imperial' | 'metric';
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsUrl = `${environment.settingsUrl}`;
  private defaultSettings: UserSettings = {
    theme: 'dark-theme',
    language: 'en',
    locale: 'metric',
    notifications: true,
    searchPreference: 'original'
  };
  
  private settingsSubject = new BehaviorSubject<UserSettings>(this.defaultSettings);
  public settings$ = this.settingsSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {
    this.loadSettings();
  }
  
  private loadSettings(): void {
    // First try to load from localStorage for immediate display
    const localSettings = this.getLocalSettings();
    
    // If local settings available, use them
    if (localSettings) {
      console.log('Using local settings:', localSettings);
      this.settingsSubject.next(localSettings);
    } else {
      // Try to load from cookies as fallback
      const cookieSettings = this.getCookieSettings();
      if (cookieSettings) {
        console.log('Using cookie settings:', cookieSettings);
        this.settingsSubject.next(cookieSettings);
      }
    }
    
    // Then fetch from server (if user is authenticated)
    if (localStorage.getItem('token')) {
      this.fetchRemoteSettings().subscribe({
        // Success handler already updates settings in the pipe
        error: (err) => {
          console.error('Error fetching remote settings:', err);
          // We already applied local settings, so nothing more to do here
        }
      });
    }
  }
  
  private getLocalSettings(): UserSettings | null {
    try {
      const settings = localStorage.getItem('user_settings');
      return settings ? JSON.parse(settings) : null;
    } catch (e) {
      console.error('Error parsing local settings:', e);
      return null;
    }
  }
  
  private getCookieSettings(): UserSettings | null {
    try {
      const settings = this.cookieService.get('user_settings');
      return settings ? JSON.parse(settings) : null;
    } catch (e) {
      console.error('Error parsing cookie settings:', e);
      return null;
    }
  }
  
  private saveLocalSettings(settings: UserSettings): void {
    try {
      localStorage.setItem('user_settings', JSON.stringify(settings));
      // Also save to cookies as fallback
      this.cookieService.set('user_settings', JSON.stringify(settings), 30); // expires in 30 days
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }
  
  fetchRemoteSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(this.settingsUrl)
      .pipe(
        tap(settings => {
          console.log('Received remote settings:', settings);
          this.settingsSubject.next(settings);
          this.saveLocalSettings(settings);
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching settings:', error);
          
          // Use existing settings from local storage or cookies
          const localSettings = this.getLocalSettings() || this.getCookieSettings();
          
          // If we have local settings, use them
          if (localSettings) {
            return of(localSettings);
          }
          
          // If no local settings, use defaults
          return of(this.defaultSettings);
        })
      );
  }
  
  updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): Observable<UserSettings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, [key]: value };
    
    // Update local state immediately for responsive UI
    this.settingsSubject.next(updatedSettings);
    this.saveLocalSettings(updatedSettings);
    
    // Only send to server if authenticated
    if (!localStorage.getItem('token')) {
      return of(updatedSettings);
    }
    
    // Send to server
    return this.http.patch<UserSettings>(this.settingsUrl, { [key]: value })
      .pipe(
        tap(response => {
          // Update with server response (in case of any normalization)
          this.settingsSubject.next(response);
          this.saveLocalSettings(response);
        }),
        catchError(error => {
          console.error('Error updating settings:', error);
          // No rollback needed as we already saved locally
          return of(updatedSettings);
        })
      );
  }
  
  getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.settingsSubject.value[key];
  }
}