import { Component, ViewEncapsulation, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { translations } from './translations';

@Component({
    standalone: true,
    selector: 'puibe-storybook-wrapper',
    template: `<ng-content></ng-content>`,
    encapsulation: ViewEncapsulation.None,
    styles: [
        `
            #storybook-root,
            storybook-root,
            puibe-storybook-wrapper {
                display: block;
                height: 100%;
                width: 100%;
            }

            puibe-storybook-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: 'Roboto';
            }
        `,
    ],
})
export class StorybookWrapperComponent {
    constructor() {
        const translateService = inject(TranslateService);

        translateService.setDefaultLang('de-CH');
        translateService.use('de').subscribe();
        translateService.setTranslation('de', translations);

        document.querySelectorAll('html, body').forEach((el: HTMLElement) => (el.style.height = '100%'));
    }
}
