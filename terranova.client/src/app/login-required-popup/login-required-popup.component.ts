import { Component, Inject, OnInit, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LoginPopupService } from '../services/login-popup.service';

@Component({
	selector: 'app-login-required-popup',
	standalone: true,
	imports: [CommonModule, ConfirmDialogModule, ButtonModule],
	templateUrl: './login-required-popup.component.html',
	styleUrl: './login-required-popup.component.scss'
})
export class LoginRequiredPopupComponent implements OnInit {
	@ViewChild('cd') confirmDialog!: ConfirmDialog;
	isVisible = signal<boolean>(false);
	private router = inject(Router);
	private loginPopupService = inject(LoginPopupService);

	constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

	ngOnInit() {
		// IMPORTANTE: Sottoscrivi solo nel browser
		if (isPlatformBrowser(this.platformId)) {
			this.loginPopupService.isVisible$.subscribe(isVisible => {
				if (isVisible) {
					this.show();
				} else {
					this.hide();
				}
			});
		}
	}

	show() {
		if (isPlatformBrowser(this.platformId) && this.confirmDialog) {
			this.isVisible.set(true);
			this.confirmDialog.visible = true;
		}
	}

	hide() {
		if (isPlatformBrowser(this.platformId) && this.confirmDialog) {
			this.isVisible.set(false);
			this.confirmDialog.visible = false;
		}
	}

	onLogin() {
		this.hide();
		this.router.navigate(['/login']);
	}

	onClose() {
		this.hide();
	}
}

