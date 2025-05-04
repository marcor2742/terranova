import { TranslateLoader } from '@ngx-translate/core';
import { TransferState, makeStateKey } from '@angular/core';
import { Observable } from 'rxjs';

export class TranslateServerLoader implements TranslateLoader {
	constructor(
		private transferState: TransferState,
		private prefix = 'assets/i18n/',
		private suffix = '.json'
	) { }

	getTranslation(lang: string): Observable<any> {
		return new Observable(observer => {
			try {
				// Importazioni condizionali solo lato server
				// Queste vengono eseguite a runtime, quindi non vengono incluse nel bundle client
				if (typeof window === 'undefined') { // Verifica che siamo sul server
					const fs = require('fs');
					const path = require('path');
					const url = require('url');

					// Ottieni il percorso corrente solo sul server
					const __filename = url.fileURLToPath(import.meta.url);
					const __dirname = path.dirname(__filename);

					// Risali alla directory base del progetto
					const projectRoot = path.resolve(__dirname, '../../..');

					// Percorsi possibili per il file di traduzione
					const paths = [
						path.join(projectRoot, 'dist/terranova.client/browser/assets/i18n', `${lang}.json`),
						path.join(projectRoot, 'src/assets/i18n', `${lang}.json`)
					];

					let data = {};
					let fileFound = false;

					// Prova ogni percorso fino a trovare il file
					for (const filePath of paths) {
						if (fs.existsSync(filePath)) {
							data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
							fileFound = true;
							console.log(`Translation file found at: ${filePath}`);
							break;
						}
					}

					if (!fileFound) {
						console.warn(`Translation file for "${lang}" not found in any of the expected locations. Using empty object.`);
					}

					const key = makeStateKey<any>('transfer-translate-' + lang);
					this.transferState.set(key, data);

					observer.next(data);
					observer.complete();
				} else {
					// Se siamo sul lato client (non dovrebbe succedere, ma per sicurezza)
					console.warn('TranslateServerLoader is being used on the client side!');
					observer.next({});
					observer.complete();
				}
			} catch (error) {
				console.error('Error loading translation file:', error);
				observer.next({});
				observer.complete();
			}
		});
	}
}

export function translateServerLoaderFactory(ts: TransferState) {
	return new TranslateServerLoader(ts);
}
