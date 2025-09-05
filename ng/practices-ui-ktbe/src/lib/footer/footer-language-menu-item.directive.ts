import { Directive } from '@angular/core';

import { PuibeHeaderLanguageMenuItemDirective } from '../..';

@Directive({
    standalone: true,
    selector: 'button[puibeFooterLanguageMenuItem]',
    hostDirectives: [
        {
            directive: PuibeHeaderLanguageMenuItemDirective,
            inputs: ['isActive', 'language'],
            // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
            outputs: ['languageChanged'],
        },
    ],
})
export class PuibeFooterLanguageMenuItemDirective {}
