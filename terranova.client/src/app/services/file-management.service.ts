import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    HttpClient,
    HttpRequest,
    HttpEvent,
    HttpEventType,
    HttpResponse,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { filter, map, catchError } from 'rxjs/operators';

export interface UploadResponse {
    url?: string;
    error?: string;
}

@Injectable({
    providedIn: 'root',
})
export class FileManagementService {
    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID
    ) {}

    uploadFile(file: File, uploadUrl: string): Observable<UploadResponse> {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        const req = new HttpRequest('POST', uploadUrl, formData, {
            reportProgress: true,
        });

        return this.http.request(req).pipe(
            filter(
                (event: HttpEvent<any>): event is HttpResponse<any> =>
                    event.type === HttpEventType.Response
            ),
            map((event: HttpResponse<any>) => {
                const body = event.body;
                if (body && typeof body.url === 'string') {
                    return { url: body.url };
                }
                if (typeof body === 'string' && (body.startsWith('http://') || body.startsWith('https://'))) {
                    return { url: body };
                }
                return { error: 'Upload successful, but the response format was unexpected.' };
            }),
            catchError((errorResponse: HttpErrorResponse) => {
                let errorMessage = 'Upload failed.';
                if (errorResponse.error instanceof ErrorEvent) {
                    errorMessage = `Network error: ${errorResponse.error.message}`;
                } else {
                    errorMessage = `Server error (${errorResponse.status}): `;
                    if (errorResponse.error && typeof errorResponse.error.message === 'string') {
                        errorMessage += errorResponse.error.message;
                    } else if (errorResponse.error && typeof errorResponse.error.error === 'string') {
                        errorMessage += errorResponse.error.error;
                    } else if (typeof errorResponse.error === 'string' && errorResponse.error.length < 250 && errorResponse.error.indexOf('<') === -1) {
                        errorMessage += errorResponse.error;
                    } else {
                        errorMessage += errorResponse.message || 'Check console for more details.';
                    }
                }
                return of({ error: errorMessage });
            })
        );
    }

    downloadFile(fileUrl: string): void {
        if (isPlatformBrowser(this.platformId)) { // Guard with isPlatformBrowser
            if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
                window.open(fileUrl, '_blank');
            } else {
                console.error('Download attempt with invalid or missing URL:', fileUrl);
            }
        } else {
            console.warn('FileManagementService.downloadFile called on the server. Download operation skipped.');
        }
    }
}