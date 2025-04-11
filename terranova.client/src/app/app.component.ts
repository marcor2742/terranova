import {
	Component,
	OnInit,
	PLATFORM_ID,
	Inject,
	AfterViewInit,
} from '@angular/core';
import { ThemeService } from './services/theme.service';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

/**
 * Root component of the Terranova application
 * Handles application initialization and theme setup
 */
@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
	/** Application title */
	title = 'FrontEnd';

	/**
	 * Creates a new AppComponent instance
	 * @param themeService - Service for managing application themes
	 * @param platformId - Angular's platform identifier for SSR compatibility
	 */
	constructor(
		private themeService: ThemeService,
		@Inject(PLATFORM_ID) private platformId: Object
	) {}

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
