import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoginPopupService {
	private visibilitySubject = new BehaviorSubject<boolean>(false);
	isVisible$ = this.visibilitySubject.asObservable();

	constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

	get isVisible(): boolean {
		return this.visibilitySubject.value;
	}

	showLoginPopup() {
		// Mostra il popup solo se siamo nel browser
		if (isPlatformBrowser(this.platformId)) {
			console.log('LoginPopupService: showing popup');
			this.visibilitySubject.next(true);
		}
	}

	hideLoginPopup() {
		if (isPlatformBrowser(this.platformId)) {
			this.visibilitySubject.next(false);
		}
	}
}
