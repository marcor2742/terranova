import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, of, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserSettings {
  theme: string;
  language: string;
  notifications: boolean;
  displayMode: 'grid' | 'list';
  // Add other settings as needed
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsUrl = `${environment.userInfoUrl}/settings`;
  private defaultSettings: UserSettings = {
    theme: 'dark-theme',
    language: 'en',
    notifications: true,
    displayMode: 'grid'
  };
  
  private settingsSubject = new BehaviorSubject<UserSettings>(this.defaultSettings);
  public settings$ = this.settingsSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadSettings();
  }
  
  private loadSettings(): void {
    // First try to load from localStorage for immediate display
    const localSettings = this.getLocalSettings();
    if (localSettings) {
      this.settingsSubject.next(localSettings);
    }
    
    // Then fetch from server (if user is authenticated)
    if (localStorage.getItem('token')) {
      this.fetchRemoteSettings();
    }
  }
  
  private getLocalSettings(): UserSettings | null {
    const settings = localStorage.getItem('user_settings');
    return settings ? JSON.parse(settings) : null;
  }
  
  private saveLocalSettings(settings: UserSettings): void {
    localStorage.setItem('user_settings', JSON.stringify(settings));
  }
  
  fetchRemoteSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(this.settingsUrl)
      .pipe(
        tap(settings => {
          this.settingsSubject.next(settings);
          this.saveLocalSettings(settings);
        }),
        catchError(error => {
          console.error('Error fetching settings:', error);
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
          // Rollback on error
          this.settingsSubject.next(currentSettings);
          this.saveLocalSettings(currentSettings);
          throw error;
        })
      );
  }
  
  getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
    return this.settingsSubject.value[key];
  }
}