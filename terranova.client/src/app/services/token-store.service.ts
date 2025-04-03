import { Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokenStoreService {
  private readonly TOKEN_KEY = '';
  private readonly REFRESH_TOKEN_KEY = '';
  private platformId = inject(PLATFORM_ID);
  
  // Signal-based token storage
  private accessTokenSignal = signal<string | null>(null);
  private refreshTokenSignal = signal<string | null>(null);
  
  constructor() {
    // Initialize from localStorage only in browser
    this.initTokensFromStorage();
  }
  
  private initTokensFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const accessToken = localStorage.getItem(this.TOKEN_KEY);
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      
      this.accessTokenSignal.set(accessToken);
      this.refreshTokenSignal.set(refreshToken);
    }
  }
  
  getAccessToken(): string | null {
    const token = this.accessTokenSignal();
    if (token && this.isTokenExpired(token)) {
      return null;
    }
    return token;
  }
  
  getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }
  
  setTokens(accessToken: string, refreshToken: string): void {
    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }
  
  clearTokens(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }
  
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  }
}