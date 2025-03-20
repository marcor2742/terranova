import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, input } from '@angular/core';
import { ButtonComponent } from 'my-ui';

@Component({
	selector: 'app-confirmation-modal',
	imports: [CommonModule, ButtonComponent],
	templateUrl: './confirmation-modal.component.html',
	styleUrl: './confirmation-modal.component.scss',
})
export class ConfirmationModalComponent {
	readonly show = input(false);
	readonly title = input('basic configuration');
	readonly message = input('Basic question');
	readonly description = input('Basic Description');
	readonly confirmText = input('Confirm');
	readonly cancelText = input('Cancel');
	readonly highlightedText = input('');

	@Output() confirmed = new EventEmitter<void>();
	@Output() cancelled = new EventEmitter<void>();

	onConfirm(): void {
		this.confirmed.emit();
	}

	onCancel(): void {
		this.cancelled.emit();
	}
}
//<app-confirmation-modal></...>