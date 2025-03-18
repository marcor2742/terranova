import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonComponent } from 'my-ui';

@Component({
	selector: 'app-confirmation-modal',
	standalone: true,
	imports: [CommonModule, ButtonComponent],
	templateUrl: './confirmation-modal.component.html',
	styleUrl: './confirmation-modal.component.scss',
})
export class ConfirmationModalComponent {
	@Input() show = false;
	@Input() title = 'basic configuration';
	@Input() message = 'Basic question';
	@Input() description = 'Basic Description';
	@Input() confirmText = 'Confirm';
	@Input() cancelText = 'Cancel';
	@Input() highlightedText = '';

	@Output() confirmed = new EventEmitter<void>();
	@Output() cancelled = new EventEmitter<void>();

	onConfirm(): void {
		this.confirmed.emit();
	}

	onCancel(): void {
		this.cancelled.emit();
	}
}
