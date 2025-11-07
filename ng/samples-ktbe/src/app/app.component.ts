import { AsyncPipe } from '@angular/common';
import { Component, Injector, inject } from '@angular/core';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TitleService } from '@nexplore/practices-ui';
import {
  PuibeFooterComponent,
  PuibeFooterCopyrightDirective,
  PuibeFooterDirective,
  PuibeFooterLanguageMenuItemDirective,
  PuibeFooterMenuItemDirective,
  PuibeGlobalDirtyGuardDirective,
  PuibeHeaderComponent,
  PuibeHeaderDirective,
  PuibeHeaderLanguageMenuItemDirective,
  PuibeHeaderMainMenuItemDirective,
  PuibeHeaderMobileMenuItemDirective,
  PuibeHeaderServiceMenuItemDirective,
  PuibeIconLoginComponent,
  PuibeIconSearchComponent,
  PuibeIconSearchMobileComponent,
  PuibeShellComponent,
  PuibeShellService,
  PuibeSidenavFooterComponent,
  PuibeSkipLinkComponent,
  PuibeStatusHubComponent,
  RouterUtilService
} from '@nexplore/practices-ui-ktbe';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, map, startWith } from 'rxjs';
import { registerStatusForNavigation } from './practices-ui-ktbe-samples/status-hub/status.utils';
import { translations } from './translations';

@Component({
    standalone: true,
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [
    RouterLink,
    PuibeShellComponent,
    PuibeHeaderDirective,
    PuibeHeaderComponent,
    PuibeHeaderLanguageMenuItemDirective,
    PuibeHeaderServiceMenuItemDirective,
    PuibeHeaderMainMenuItemDirective,
    PuibeHeaderMobileMenuItemDirective,
    PuibeIconSearchComponent,
    PuibeIconSearchMobileComponent,
    PuibeIconLoginComponent,
    PuibeFooterDirective,
    PuibeFooterComponent,
    PuibeSidenavFooterComponent,
    PuibeFooterCopyrightDirective,
    PuibeFooterMenuItemDirective,
    PuibeFooterLanguageMenuItemDirective,
    PuibeSkipLinkComponent,
    AsyncPipe,
    RouterOutlet,
    PuibeGlobalDirtyGuardDirective,
    PuibeStatusHubComponent
],
})
export class AppComponent {
    private _translateService = inject(TranslateService);
    private _titleService = inject(TitleService);
    private _shellService = inject(PuibeShellService);

    private readonly languageKeys = { de: 'de-ch', fr: 'fr-ch', en: 'en-us' };
    readonly availableLanguages = ['de', 'fr', 'en'];

    openSideNav: boolean;

    currentLang$ = this._translateService.onLangChange.pipe(
        map((l) => l.lang),
        startWith(this._translateService.currentLang)
    );

    // Without the debounce we will get a `ExpressionChangedAfterItHasBeenCheckedError`
    title$ = this._titleService.title$.pipe(debounceTime(1));

    overrideStatusHub = false;

    constructor() {
        const router = inject(Router);
        const routerUtil = inject(RouterUtilService);
        const injector = inject(Injector);

        this._translateService.use(this.languageKeys.en).subscribe();
        this._translateService.setDefaultLang(this.languageKeys.en);
        this._translateService.setTranslation(this.languageKeys.en, translations);

        this._titleService.title$.subscribe((t) => console.log('🎉Title Updated: ' + t));

        router.events.subscribe((ev) => {
            if (ev instanceof NavigationStart) {
                // This method registers status for navigation events
                registerStatusForNavigation(ev, injector);

                // This is an example how to redirect to absolute urls. TODO: Provide some kind of generic service/interceptor
                const tail = routerUtil.getRoutesForUrl(ev.url, router.config, { fullMatch: true }).slice(-1)[0];
                if (
                    tail &&
                    tail.redirectTo &&
                    typeof tail.redirectTo === 'string' &&
                    tail.redirectTo.startsWith('http')
                ) {
                    window.open(tail.redirectTo);
                }
            }
        });
    }

    isLanguageActive(language: string): boolean {
        return this._translateService.currentLang === this.languageKeys[language.toLowerCase()];
    }

    onLanguageChange(language: string) {
        this._translateService.use(this.languageKeys[language.toLowerCase()]).subscribe();
    }

    onClick() {
        console.log('clicked');
    }

    onClickMainMenu() {
        // Opens current route by default (in mobile view only opens the main menu)
        this._shellService.openRouteInSideMenu({ routePath: [] });
    }
}
