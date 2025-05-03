import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class LoginPopupService {
	isVisible = false;

	constructor(private router: Router) { }

	show(): void {
		this.isVisible = true;
	}

	hide(): void {
		this.isVisible = false;
	}

	redirectToLogin(): void {
		this.hide();
		this.router.navigateByUrl('/login');
	}

	onLogin()
	{
		this.hide();
		this.router.navigateByUrl('/login');
	}

	onClose() {
		this.hide();
	}
}
