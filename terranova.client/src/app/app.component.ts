import {
	Component,
	OnInit,
	PLATFORM_ID,
	Inject,
	AfterViewInit,
	OnDestroy,
	ViewChild,
} from '@angular/core';
import { ThemeService } from './services/theme.service';
import { RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LoginRequiredPopupComponent } from './login-required-popup/login-required-popup.component';
import { TranslateService } from '@ngx-translate/core';
import { LoginPopupService } from './services/login-popup.service';
import { Subscription } from 'rxjs';

/**
 * Root component of the Terranova application
 * Handles application initialization and theme setup
 */
@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, CommonModule],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	/** Application title */
	title = 'FrontEnd';
	/**
	 * Creates a new AppComponent instance
	 * @param themeService - Service for managing application themes
	 * @param platformId - Angular's platform identifier for SSR compatibility
	 */
	constructor(
		private themeService: ThemeService,
		private translate: TranslateService,
		@Inject(PLATFORM_ID) private platformId: Object
	) {
		this.translate.setDefaultLang('en');

		if (isPlatformBrowser(this.platformId)) {
			const browserLang = this.translate.getBrowserLang();
			this.translate.use(browserLang || 'en');
		}
		else {
			this.translate.use('en');
		}
	}

	

	/**
	 * Initializes the component
	 * Sets up the initial theme for the application
	 */
	ngOnInit() {
		// Initialize in ngOnInit
		if (isPlatformBrowser(this.platformId)) {
			// Load saved theme or default to dark
			this.themeService.setTheme('dark-theme');

		
		}
	}
	ngOnDestroy() {
		// clean up
	}

	/**
	 * Runs after the view is initialized
	 * Ensures theme is properly applied after DOM is ready
	 */
	ngAfterViewInit() {
		// Force a second application to ensure theme takes effect
		if (isPlatformBrowser(this.platformId)) {
			setTimeout(() => {
				const currentTheme = this.themeService.getCurrentTheme();
				this.themeService.setTheme(currentTheme);
			}, 0);
		}
	}
}
