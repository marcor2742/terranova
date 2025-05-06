import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-not-found',
	standalone: true,
	imports: [CommonModule, RouterModule, ButtonModule, TranslateModule],
	template: `
		<div class="not-found-container">
			<div class="not-found-content">
				<div class="not-found-icon">404</div>
				<h1>{{ 'PageNotFound' | translate }}</h1>
				<p>{{ 'PageNotFoundMessage' | translate }}</p>
				<p-button
					[routerLink]="['/home']"
					label="{{ 'BackToHome' | translate }}"
					styleClass="p-button-primary"
				>
				</p-button>
			</div>
		</div>
	`,
	styles: `
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: var(--surface-ground);
    }
    
    .not-found-content {
      text-align: center;
      background-color: var(--surface-card);
      padding: 3rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }
    
    .not-found-icon {
      font-size: 6rem;
      font-weight: bold;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    h1 {
      margin-bottom: 1rem;
      color: var(--text-color);
    }
    
    p {
      margin-bottom: 2rem;
      color: var(--text-secondary-color);
    }
  `,
})
export class NotFoundComponent {}
