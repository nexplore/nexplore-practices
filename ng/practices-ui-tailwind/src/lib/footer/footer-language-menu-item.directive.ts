import { Directive } from '@angular/core';

import { PuiHeaderLanguageMenuItemDirective } from '../..';

@Directive({
    standalone: true,
    selector: 'button[puiFooterLanguageMenuItem]',
    hostDirectives: [
        {
            directive: PuiHeaderLanguageMenuItemDirective,
            inputs: ['isActive', 'language'],
            // eslint-disable-next-line @angular-eslint/no-outputs-metadata-property
            outputs: ['languageChanged'],
        },
    ],
})
export class PuiFooterLanguageMenuItemDirective {}

