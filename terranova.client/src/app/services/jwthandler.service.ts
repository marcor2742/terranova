import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TokenStoreService } from './token-store.service';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Track refresh operations
  private refreshInProgress = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private tokenStore: TokenStoreService
  ) {}

  getAccessToken(): string | null {
    return this.tokenStore.getAccessToken();
  }

  getRefreshToken(): string | null {
    return this.tokenStore.getRefreshToken();
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.tokenStore.setTokens(accessToken, refreshToken);
  }

  clearTokens(): void {
    this.tokenStore.clearTokens();
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // If refresh already in progress, don't start another
    if (this.refreshInProgress.value) {
      return new Observable((observer) => {
        const subscription = this.refreshInProgress.subscribe(
          (inProgress) => {
            if (!inProgress) {
              observer.next({
                accessToken: this.getAccessToken() || '',
                refreshToken: this.getRefreshToken() || '',
              });
              observer.complete();
              subscription.unsubscribe();
            }
          }
        );
      });
    }

    this.refreshInProgress.next(true);

    return this.http
      .post<TokenResponse>(`${environment.refreshUrl}`, {
        refreshToken,
      })
      .pipe(
        tap((tokens) => {
          this.setTokens(tokens.accessToken, tokens.refreshToken);
          this.refreshInProgress.next(false);
        }),
        catchError((error) => {
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