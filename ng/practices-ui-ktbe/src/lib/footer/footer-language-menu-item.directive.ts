import { Directive } from '@angular/core';

import { PuibeHeaderLanguageMenuItemDirective } from '../..';

@Directive({
    standalone: true,
    selector: 'button[puibeFooterLanguageMenuItem]',
    hostDirectives: [
        {
            directive: PuibeHeaderLanguageMenuItemDirective,
            inputs: ['isActive', 'language'],
            outputs: ['languageChanged'],
        },
    ],
})
export class PuibeFooterLanguageMenuItemDirective {}
