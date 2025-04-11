import {
	ApplicationConfig,
	ErrorHandler,
	importProvidersFrom,
	provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
	provideClientHydration,
	withEventReplay,
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
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

class CustomErrorHandler implements ErrorHandler {
	handleError(error: any): void {
	  console.error('Angular error details:', error);
	  if (error && error.stack) {
		console.error('Error stack:', error.stack);
	  }
	  if (error && error.componentStack) {
		console.error('Component stack:', error.componentStack);
	  }
	}
  }


export const appConfig: ApplicationConfig = (() => {
	try {
		return {
			providers: [
				// { provide: ErrorHandler, useClass: ErrorHandler},
				{ provide: ErrorHandler, useClass: CustomErrorHandler },
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
							deps: [HttpClient],
						},
					})
				),
				provideAnimationsAsync(),
				providePrimeNG({
					theme: {
						preset: Aura,
					},
					ripple: true,
				}),
			],
		};
	} catch (error) {
		console.error('Error during app configuration:', error);
		return { providers: [] }; // Return an empty configuration or handle as needed
	}
})();