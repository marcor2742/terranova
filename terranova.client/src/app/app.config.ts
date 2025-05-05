import {
	ApplicationConfig,
	ErrorHandler,
	importProvidersFrom,
	PLATFORM_ID,
	provideZoneChangeDetection,
    TransferState,
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
//import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
//import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { CookieService } from 'ngx-cookie-service';
import {
	TranslateModule,
	TranslateLoader,
	provideTranslateService,
} from '@ngx-translate/core';
//import { ServerTransferStateModule } from '@angular/platform-server';

import {
	translateServerLoaderFactory,
} from './loaders/translate-server.loader';
import {
	translateBrowserLoaderFactory,
} from './loaders/translate-browser.loader';
import { isPlatformServer } from '@angular/common';
// AoT requires an exported function for factories
//export function HttpLoaderFactory(http: HttpClient) {
//	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
//}

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
						loader: {
							provide: TranslateLoader,
							useFactory: (
								platformId: Object,
								ts: TransferState,
								http: HttpClient
							) => {
								return isPlatformServer(platformId)
									? translateServerLoaderFactory(ts)
									: translateBrowserLoaderFactory(http, ts);
							},
							deps: [PLATFORM_ID, TransferState, HttpClient],
						},
						defaultLanguage: 'en',
					})
				),
				provideAnimationsAsync(),
				providePrimeNG({
					theme: {
						preset: Aura,
					},
					ripple: true,
				}),
				CookieService,
			],
		};
	} catch (error) {
		console.error('Error during app configuration:', error);
		return { providers: [] }; // Return an empty configuration or handle as needed
	}
})();

									//ciao
