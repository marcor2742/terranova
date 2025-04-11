import { mergeApplicationConfig, ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

class ServerErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('SERVER ERROR DETAILS:', error);
    console.error('Stack trace:', error?.stack || 'No stack trace available');
    // Log component details if available
    if (error && error.ngDebugContext) {
      console.error('Component:', error.ngDebugContext.component);
    }
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
