import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { App } from './app/app';

bootstrapApplication(App, {
    providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter([]), provideTranslateService()],
}).catch((err) => console.error(err));
