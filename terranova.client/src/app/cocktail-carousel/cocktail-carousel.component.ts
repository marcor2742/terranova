import {
	Component,
	input,
	output,
	ViewChild,
	ElementRef,
	inject,
	OnDestroy,
	Renderer2,
	PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Cocktail } from '../Classes/cocktail';
import { ButtonModule } from 'primeng/button';
import { CarouselModule, Carousel } from 'primeng/carousel';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-dashboard-carousel',
	standalone: true,
	imports: [
		CommonModule,
		ButtonModule,
		CarouselModule,
		RouterModule,
		TranslateModule,
	],
	templateUrl: './cocktail-carousel.component.html',
	styleUrl: './cocktail-carousel.component.scss',
})
export class CocktailCarouselComponent implements OnDestroy {
	private platformId = inject(PLATFORM_ID);
	private renderer = inject(Renderer2);

	cocktails = input<Cocktail[]>([]);
	numVisible = input<number>(5);
	responsiveOptions = input<any[]>([
		{ breakpoint: '1024px', numVisible: 3, numScroll: 3 },
		{ breakpoint: '600px', numVisible: 2, numScroll: 2 },
		{ breakpoint: '480px', numVisible: 1, numScroll: 1 },
	]);
	loadMore = output<void>();
	disabled = input<boolean>(false);

	@ViewChild('carousel') carousel!: Carousel;

	private loadTriggered = false;
	private loadResetTimeout: any = null;

	ngOnDestroy() {
		// Clear any pending timeouts
		if (this.loadResetTimeout) {
			clearTimeout(this.loadResetTimeout);
		}
	}

	onPageChange(event: any) {
		// Skip server-side execution completely
		if (!isPlatformBrowser(this.platformId)) {
			return;
		}

		if (this.disabled()) {
			return;
		}

		// Calculate if we're near the end of available items
		const cocktailsArr = this.cocktails();
		if (!cocktailsArr || !cocktailsArr.length) {
			return;
		}

		const totalItems = cocktailsArr.length;
		const itemsPerPage = event.rows || this.numVisible();
		const currentFirstItem = event.first || 0;
		const itemsLeft = totalItems - (currentFirstItem + itemsPerPage);
		const loadThreshold = itemsPerPage; // Load more when less than one page left

		if (itemsLeft <= loadThreshold && !this.loadTriggered) {
			console.log(
				`Near end of carousel (${itemsLeft} items left), loading more...`
			);
			this.loadTriggered = true;
			this.loadMore.emit();

			// Store timeout reference for cleanup
			this.loadResetTimeout = setTimeout(() => {
				this.loadTriggered = false;
				this.loadResetTimeout = null;
			}, 1000);
		}
	}
}
