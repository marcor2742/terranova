import {
	Component,
	OnInit,
	PLATFORM_ID,
	Inject,
	AfterViewInit,
	OnDestroy,
	ViewChild,
	inject,
} from '@angular/core';
import { ThemeService } from './services/theme.service';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LoginPopupService } from './services/login-popup.service';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';

/**
 * Root component of the Terranova application
 * Handles application initialization and theme setup
 */
@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet, CommonModule, ButtonModule, ConfirmDialogModule],
	providers: [ConfirmationService],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	/** Application title */
	title = 'FrontEnd';
	private loginPopupSubscription: Subscription | undefined;

	// Inject services using inject() or constructor
	private themeService = inject(ThemeService);
	private translate = inject(TranslateService);
	private loginPopupService = inject(LoginPopupService);
	private confirmationService = inject(ConfirmationService);
	private router = inject(Router);

	constructor(@Inject(PLATFORM_ID) private platformId: Object) {
		this.translate.setDefaultLang('en');

		if (isPlatformBrowser(this.platformId)) {
			const browserLang = this.translate.getBrowserLang();
			this.translate.use(browserLang || 'en');
		} else {
			this.translate.use('en');
		}
	}

	/**
	 * Initializes the component
	 * Sets up the initial theme and subscribes to the login popup service
	 */
	ngOnInit() {
		if (isPlatformBrowser(this.platformId)) {
			// Load saved theme or default to dark
			this.themeService.setTheme('dark-theme');

			// Subscribe to the login popup visibility
			this.loginPopupSubscription =
				this.loginPopupService.isVisible$.subscribe((isVisible) => {
					if (isVisible) {
						console.log(
							'AppComponent: Showing login required dialog'
						);
						this.confirmationService.confirm({
							key: 'loginDialog', // Use a key to target the specific dialog
							message:
								'You need to be logged in to access this feature.',
							header: 'Login Required',
							icon: 'pi pi-exclamation-triangle',
							acceptLabel: 'Vai al login', // Customize labels if needed
							rejectLabel: 'Chiudi',
							accept: () => this.onLogin(),
							reject: () => this.onClose(),
							// Add style if needed, e.g., { width: '450px' }
						});
					}
				});
		}
	}

	ngOnDestroy() {
		// Clean up subscription
		this.loginPopupSubscription?.unsubscribe();
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

	// Methods to handle dialog actions
	onLogin() {
		// First, close the dialog explicitly
		this.confirmationService.close();
		
		// Then update the service state
		this.loginPopupService.hideLoginPopup();
		
		// Finally navigate
		this.router.navigate(['/login']);
		console.log('Navigating to login page and closing popup');
	}
	
	onClose() {
		// Close both the dialog and update the service
		this.confirmationService.close();
		this.loginPopupService.hideLoginPopup();
	}
}
