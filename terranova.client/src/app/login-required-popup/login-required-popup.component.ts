import { Component } from '@angular/core';
import { LoginPopupService } from '../services/login-popup.service';
import { CommonModule } from '@angular/common';
@Component({
	selector: 'app-login-required-popup',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './login-required-popup.component.html',
	styleUrls: ['./login-required-popup.component.css']
})
export class LoginRequiredPopupComponent {
	constructor(private loginPopupService: LoginPopupService) { }

	get isVisible(): boolean {
		return this.loginPopupService.isVisible;
	}

	onLogin(): void {
		this.loginPopupService.onLogin();
	}

	onClose(): void {
		this.loginPopupService.onClose();
	}

}
