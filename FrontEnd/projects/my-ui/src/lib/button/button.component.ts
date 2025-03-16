import { Component, EventEmitter, Input, Output, AfterContentInit, ElementRef } from '@angular/core';
import { HlmButtonModule } from '@spartan-ng/ui-button-helm';
import { CommonModule } from '@angular/common';

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
export class ButtonComponent implements AfterContentInit {
    constructor(private elementRef: ElementRef) {}

    @Input() text = 'Press me';
    @Input() variant: ButtonVariant = 'default';
    @Input() size: ButtonSize = 'default';
    @Input() disabled = false;
    @Input() loading = false;
    @Input() fullWidth = false;
    @Input() id?: string;
    @Input() value?: any;

    @Output() buttonClick = new EventEmitter<ButtonClickEvent>();
    
    hasContent = false;

	ngAfterContentInit() {
        // Check for projected content
        setTimeout(() => {
            const buttonEl = this.elementRef.nativeElement.querySelector('button');
            if (buttonEl) {
                const hasProjectedContent = Array.from(buttonEl.childNodes as Node[]).some((node: Node) => {
                    // Skip text nodes or empty nodes
                    return node.nodeType !== Node.TEXT_NODE || 
                           ((node as Text).textContent || '').trim() !== '';
                });
                this.hasContent = hasProjectedContent;
            }
        });
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