import { NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ClarityModule } from '@clr/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { APP_ROUTES } from './app.routes';
import { StatusAlertComponent } from './status-alert/status-alert.component';
import { translations } from './translations';

@NgModule({
    declarations: [AppComponent, StatusAlertComponent],
    imports: [
        BrowserModule,
        ClarityModule,
        RouterModule.forRoot(APP_ROUTES),
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    private translateService = inject(TranslateService);

    constructor() {
        this.translateService.use('en').subscribe();
        this.translateService.setTranslation('en', translations);
    }
}
