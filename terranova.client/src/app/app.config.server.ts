import { mergeApplicationConfig, ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

class ServerErrorHandler implements ErrorHandler {
	handleError(error: any): void {
		console.error('=== SERVER RENDERING ERROR ===');
		console.error('Error:', error);
		console.error('Type:', typeof error);
		console.error('Keys:', error ? Object.keys(error) : 'No keys (undefined)');
		
		// Try to extract useful information even if stack is missing
		if (error) {
		  console.error('Message:', error.message);
		  console.error('Name:', error.name);
		  console.error('Stack:', error.stack || 'No stack trace');
		}
		console.error('=== END SERVER RENDERING ERROR ===');
	  }
  }

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
	{ provide: ErrorHandler, useClass: ServerErrorHandler },
    provideServerRouting(serverRoutes)
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
