import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface TokenPayload {
  sub: string;
  exp: number;

}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = '';
  private readonly REFRESH_TOKEN_KEY = '';
  
  // Signal-based token storage for in-memory access
  private accessTokenSignal = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private refreshTokenSignal = signal<string | null>(localStorage.getItem(this.REFRESH_TOKEN_KEY));
  
  // Track refresh operations
  private refreshInProgress = new BehaviorSubject<boolean>(false);
  
  constructor(private http: HttpClient) {}
  
  getAccessToken(): string | null {
    const token = this.accessTokenSignal();
    
    if (token && this.isTokenExpired(token)) {
      // Don't return expired tokens
      return null;
    }
    
    return token;
  }
  
  getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }
  
  setTokens(accessToken: string, refreshToken: string): void {
    // Update in-memory signals
    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
    
    // Persist to localStorage for session continuity
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }
  
  clearTokens(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
  
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  }
  
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    // If refresh already in progress, don't start another
    if (this.refreshInProgress.value) {
      return new Observable(observer => {
        const subscription = this.refreshInProgress.subscribe(inProgress => {
          if (!inProgress) {
            // Return the new tokens once refresh is complete
            observer.next({ 
              accessToken: this.accessTokenSignal() || '', 
              refreshToken: this.refreshTokenSignal() || '' 
            });
            observer.complete();
            subscription.unsubscribe();
          }
        });
      });
    }
    
    this.refreshInProgress.next(true);
    
    return this.http.post<TokenResponse>(`${environment.refreshUrl}`, {
      refreshToken
    }).pipe(
      tap(tokens => {
        this.setTokens(tokens.accessToken, tokens.refreshToken);
        this.refreshInProgress.next(false);
      }),
      catchError(error => {
        this.clearTokens();
        this.refreshInProgress.next(false);
        return throwError(() => error);
      })
    );
  }
  
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}