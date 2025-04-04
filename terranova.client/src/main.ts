import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { IconService } from './app/services/icon-service.service';

bootstrapApplication(AppComponent, appConfig)
  .then(ref => {
    // Register icons after the app is bootstrapped
    const iconService = ref.injector.get(IconService);
    iconService.registerIcons();
  })
  .catch(err => console.error(err));