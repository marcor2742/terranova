import { TranslateLoader } from '@ngx-translate/core';
import { TransferState, makeStateKey } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export class TranslateBrowserLoader implements TranslateLoader {
	constructor(private http: HttpClient, private ts: TransferState) { }
	getTranslation(lang: string): Observable<any> {
		const key = makeStateKey<any>('transfer-translate-' + lang);
		const data = this.ts.get(key, null);
		return data
			? of(data)
			: new TranslateHttpLoader(this.http, '/assets/i18n/', '.json')
				.getTranslation(lang);
	}
}
export function translateBrowserLoaderFactory(
	http: HttpClient,
	ts: TransferState
) {
	return new TranslateBrowserLoader(http, ts);
}
