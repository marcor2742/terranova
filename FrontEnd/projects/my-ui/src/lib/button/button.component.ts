import {
	Component,
	EventEmitter,
	Input,
	Output,
	AfterContentInit,
	ElementRef,
	OnInit,
	PLATFORM_ID,
	Inject,
	TemplateRef,
	ContentChild,
} from '@angular/core';
import { HlmButtonModule } from '@spartan-ng/ui-button-helm';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export type ButtonVariant =
	| 'link'
	| 'default'
	| 'destructive'
	| 'outline'
	| 'secondary'
	| 'ghost'
	| null
	| undefined;
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonClickEvent {
	id?: string;
	value?: any;
	timestamp: number;
}
@Component({
	selector: 'my-ui-button',
	standalone: true,
	imports: [CommonModule, HlmButtonModule],
	templateUrl: './button.component.html',
	styleUrl: './button.component.scss',
})
export class ButtonComponent implements OnInit {
	constructor(
		public elementRef: ElementRef,
		@Inject(PLATFORM_ID) private platformId: Object
	) {}

	@Input() text = 'Press me';
	@Input() variant: ButtonVariant = 'default';
	@Input() size: ButtonSize = 'default';
	@Input() disabled = false;
	@Input() loading = false;
	@Input() fullWidth = false;
	@Input() id?: string;
	@Input() value?: any;

	@Output() buttonClick = new EventEmitter<ButtonClickEvent>();

	@ContentChild(TemplateRef) contentTemplate!: TemplateRef<any>;

	hasContent = false;

	ngOnInit() {
		// Using a simpler approach that works with SSR
		if (isPlatformBrowser(this.platformId)) {
			// In the browser, we can check after the next render cycle
			setTimeout(() => {
				// This is safer than checking DOM content directly
				const button =
					this.elementRef.nativeElement.querySelector('button');
				// We'll consider it has content if there's anything other than the loading icon
				this.hasContent = !!this.contentTemplate;
			});
		}
	}

	onClick(event: MouseEvent): void {
		if (this.disabled || this.loading) return;

		this.buttonClick.emit({
			id: this.id,
			value: this.value,
			timestamp: Date.now(),
		});
	}
}
