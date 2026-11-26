import { registerLocaleData } from '@angular/common';
import localeDECH from '@angular/common/locales/de-CH';
import { APP_INITIALIZER, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideConsoleLogging } from '@nexplore/practices-ng-logging';
import { providePractices } from '@nexplore/practices-ui';
import { PracticesTailwindShellModule, providePracticesTailwind } from '@nexplore/practices-ui-tailwind';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { removeValidatorsOnReadonlyFieldsBehavior } from '@nexplore/practices-ng-forms';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';

registerLocaleData(localeDECH);

function InitializeLanguage(): string {
    const languageKeys = { de: 'de-ch', fr: 'fr-ch', en: 'en-us' };
    return languageKeys.de;
}

function InitializeAppFactory(translateService: TranslateService): () => Observable<any> {
    return () => translateService.use('de-ch');
}

bootstrapApplication(AppComponent, {
    providers: [
        { provide: LOCALE_ID, useFactory: InitializeLanguage },
        { provide: APP_INITIALIZER, useFactory: InitializeAppFactory, deps: [TranslateService], multi: true },
        provideConsoleLogging(),
        provideRouter(APP_ROUTES),
        importProvidersFrom(TranslateModule.forRoot(), BrowserAnimationsModule, PracticesTailwindShellModule),
        providePractices({
            rewriteResourceConfig: {
                rewriteTypeConfig: {
                    Base: {
                        rewriteTo: 'Other',
                        fallbackTo: 'Fallback',
                    },
                },
            },
            titleServiceConfig: {
                titleTransformer: (title) => title + ' | SamplesKtBE',
                autoSetBreadcrumbTitle: true,
                localize: true,
            },
        }),
        providePracticesTailwind({
            forms: {
                behaviors: [removeValidatorsOnReadonlyFieldsBehavior()],
            },
        }),
    ],
});

