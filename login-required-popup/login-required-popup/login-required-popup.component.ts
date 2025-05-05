import { Component, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LoginPopupService } from '../services/login-popup.service';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-login-required-popup',
    standalone: true,
    imports: [CommonModule, ConfirmDialogModule, ButtonModule],
    templateUrl: 'login-required-popup.component.html',
    styleUrl: './login-required-popup.component.scss',
})
export class LoginRequiredPopupComponent implements OnInit {
    private router = inject(Router);
    private loginPopupService = inject(LoginPopupService);
    private confirmationService = inject(ConfirmationService);

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loginPopupService.isVisible$.subscribe((isVisible) => {
                if (isVisible) {
                    console.log('Showing login required dialog with key: loginDialog');
                    this.confirmationService.confirm({
                        key: 'loginDialog',
                        message:
                            'You need to be logged in to access this feature.',
                        header: 'Login Required',
                        icon: 'pi pi-exclamation-triangle',
                        accept: () => this.onLogin(),
                        reject: () => this.onClose(),
                        // Optional: Add style directly if needed, though template styling is preferred
                        // style: { width: '450px' } 
                    });
                }
            });
        }
    }

    onLogin() {
        this.router.navigate(['/login']);
        this.loginPopupService.hideLoginPopup();
    }

    onClose() {
        // Ensure the dialog is hidden in the service state even if closed via UI
        this.loginPopupService.hideLoginPopup(); 
    }
}