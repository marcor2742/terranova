import {
	Component,
	input,
	output,
	ViewChild,
	ElementRef,
	OnDestroy,
	AfterViewInit,
	PLATFORM_ID,
	inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Cocktail } from '../Classes/cocktail';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';

@Component({
	selector: 'app-dashboard-carousel',
	standalone: true,
	imports: [CommonModule, ButtonModule, CarouselModule],
	templateUrl: './cocktail-carousel.component.html',
	styleUrl: './cocktail-carousel.component.scss',
})
export class CocktailCarouselComponent implements AfterViewInit, OnDestroy {
	private platformId = inject(PLATFORM_ID);

	cocktails = input<Cocktail[]>([]);
	numVisible = input<number>(5);
	responsiveOptions = input<any[]>([
		{ breakpoint: '1024px', numVisible: 3, numScroll: 3 },
		{ breakpoint: '600px', numVisible: 2, numScroll: 2 },
		{ breakpoint: '480px', numVisible: 1, numScroll: 1 },
	]);
	loadMore = output<void>();
	disabled = input<boolean>(false);

	@ViewChild('loadMoreSentinel', { static: false })
	loadMoreSentinel!: ElementRef;
	private observer?: IntersectionObserver;

	ngAfterViewInit() {
		// Only run in browser environment
		if (isPlatformBrowser(this.platformId)) {
			this.setupIntersectionObserver();
		}
	}

	setupIntersectionObserver() {
		// Verify we're in a browser and the loadMoreSentinel exists
		if (!isPlatformBrowser(this.platformId) || !this.loadMoreSentinel) {
			return;
		}

		// IntersectionObserver is only available in browser environments
		const options: IntersectionObserverInit = {
			root: null,
			rootMargin: '0px',
			threshold: 0.1,
		};

		this.observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && !this.disabled()) {
					console.log('Sentinel is visible, loading more items...');
					this.loadMore.emit();
				}
			});
		}, options);

		this.observer.observe(this.loadMoreSentinel.nativeElement);
	}

	ngOnDestroy() {
		// Only cleanup in browser environment
		if (
			isPlatformBrowser(this.platformId) &&
			this.observer &&
			this.loadMoreSentinel
		) {
			this.observer.unobserve(this.loadMoreSentinel.nativeElement);
			this.observer.disconnect();
		}
	}
}
