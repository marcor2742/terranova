import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
	provideClientHydration,
	withEventReplay,
	withI18nSupport,
} from '@angular/platform-browser';
import {
	provideHttpClient,
	withFetch,
	withInterceptors,
} from '@angular/common/http';
import { tokenInterceptor } from './interceptors/token-interceptor.interceptor';
import { refreshTokenInterceptorInterceptor } from './interceptors/refresh-token-interceptor.interceptor';

// app.config.ts
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        tokenInterceptor,
        refreshTokenInterceptorInterceptor,
      ])
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ],
};
