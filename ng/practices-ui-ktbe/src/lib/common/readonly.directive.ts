import { Directive, inject } from '@angular/core';
import { PuiReadonlyDirective } from '@nexplore/practices-ng-forms';

/**
 * @deprecated Use `PuiReadonlyDirective` from `@nexplore/practices-ng-forms`
 */
@Directive({
    selector: '[puibeReadonly]',
    standalone: true,
    hostDirectives: [
        {
            directive: PuiReadonlyDirective,
            inputs: ['puiReadonly: puibeReadonly'],
        },
    ],
})
export class PuibeReadonlyDirective {
    private readonly _puiReadonlyDirective = inject(PuiReadonlyDirective);

    readonly isReadonly$ = this._puiReadonlyDirective.isReadonly$;
}
