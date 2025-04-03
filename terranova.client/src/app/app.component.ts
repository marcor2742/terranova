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

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
	title = 'FrontEnd';

	constructor(
		private themeService: ThemeService,
		@Inject(PLATFORM_ID) private platformId: Object
	) {}

	ngOnInit() {
		// Initialize in ngOnInit
		if (isPlatformBrowser(this.platformId)) {
			// Load saved theme or default to dark
			this.themeService.setTheme('dark-theme');
		}
	}

	ngAfterViewInit() {
		// Force a second application to ensure theme takes effect
		if (isPlatformBrowser(this.platformId)) {
			setTimeout(() => {
				const currentTheme = this.themeService.currentTheme();
				this.themeService.setTheme(currentTheme);
			}, 0);
		}
	}
}
