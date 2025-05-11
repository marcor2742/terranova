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
			<div class="box">
				<!-- Immagine del vetro rotto posizionata solo sul box, non come sfondo pagina -->
				<div class="broken-glass-overlay">
					<img src="assets/brokenGlass.png" alt="Vetro rotto" class="glass-effect">
				</div>
				
				<h2>{{ 'PageNotFound' | translate }}</h2>

				<div class="error-content">
					<div class="not-found-icon">404</div>
					<p>{{ 'PageNotFoundMessage' | translate }}</p>
					
					<div class="button-group">
						<p-button
							[routerLink]="['/home']"
							label="{{ 'BackToHome' | translate }}"
							styleClass="p-button-primary"
						>
						</p-button>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: `
		@use "../app.component.scss" as app;

		$text-light: white;
		$box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);

		.not-found-container {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 100vh;
			background-size: cover;
			background-position: center;
			position: relative;
		}

		// Main container con effetto vetro
		.box {
			background: rgba(255, 255, 255, 0.15);
			backdrop-filter: blur(5px);
			-webkit-backdrop-filter: blur(5px);
			border-radius: 16px;
			box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 1px rgba(0, 0, 0, 0.3);
			border-image: linear-gradient( 145deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(0, 0, 0, 0.1) 100% );
			border-image-slice: 1;
			color: $text-light;
			max-width: 500px;
			overflow: hidden;
			padding: 0;
			position: relative;
			display: flex;
			flex-direction: column;
			flex-grow: 1;
			min-width: 200px;
			transition: all 0.3s ease;
			position: relative;
			z-index: 1;

			// Overlay del vetro rotto specifico per il box
			.broken-glass-overlay {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				pointer-events: none;
				z-index: 2;
				overflow: hidden;
				border-radius: 16px;
			}
			
			.glass-effect {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				object-fit: cover;
				opacity: 0.8;
				border-radius: 16px;
			}

			&::after {
				content: "";
				position: absolute;
				inset: 0;
				border-radius: 16px;
				padding: 1px;
				background: linear-gradient( 145deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.1) 70%, rgba(0, 0, 0, 0.05) 100% );
				-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
				-webkit-mask-composite: xor;
				mask-composite: exclude;
				pointer-events: none;
				z-index: 1;
			}

			&:hover {
				box-shadow: 0 7px 35px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.7), inset 0 -1px 1px rgba(0, 0, 0, 0.3);
			}

			@include app.mobile {
				margin: 15px;
				border-radius: 12px;

				&::after {
					border-radius: 12px;
				}
				
				.broken-glass-overlay, .glass-effect {
					border-radius: 12px;
				}
			}
			
			&::before {
				content: "";
				position: absolute;
				top: -400px;
				left: -500px;
				width: 900px;
				height: 900px;
				background: radial-gradient( circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.12) 40%, transparent 70% );
				border-radius: 50%;
				opacity: 0.8;
				pointer-events: none;
				z-index: 1;
			}
			
			h2 {
				margin-top: 30px;
				font-size: 26px;
				padding: 25px 20px;
				text-align: center;
				text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
				position: relative;
				z-index: 5; /* Testo sopra l'overlay del vetro rotto */
				letter-spacing: 0.5px;
				font-weight: 600;

				@include app.mobile {
					font-size: 22px;
					padding: 15px;
				}
			}
		}

		.error-content {
			padding: 25px;
			position: relative;
			z-index: 5; /* Contenuti sopra l'overlay del vetro rotto */
			text-align: center;

			@include app.mobile {
				padding: 15px;
			}
		}

		.not-found-icon {
			font-size: 6rem;
			font-weight: bold;
			color: var(--primary-color);
			margin-bottom: 1rem;
			text-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
		}

		p {
			margin-bottom: 2rem;
			color: var(--text-secondary-color);
			font-size: 1.1rem;
			line-height: 1.5;
			position: relative;
			z-index: 5; /* Testo sopra l'overlay del vetro rotto */
		}

		.button-group {
			display: flex;
			gap: 15px;
			width: 100%;
			margin: 30px 0 15px;
			position: relative;
			z-index: 5; /* Pulsanti sopra l'overlay del vetro rotto */
			justify-content: center;

			@include app.mobile {
				flex-direction: column;
				align-items: center;
			}
		}
	`
})
export class NotFoundComponent { }

