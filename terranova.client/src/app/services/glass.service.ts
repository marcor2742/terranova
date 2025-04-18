import { Injectable } from '@angular/core';
import { Glass } from '../Classes/cocktail';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class GlassService {
	glassUrl = environment.glassUrl;

	constructor(private http: HttpClient) {}
	getGlasses(): Observable<Glass[]> {
		return this.http.get<Glass[]>(this.glassUrl);
	}
}
