import { Directive, ElementRef, inject, Output } from '@angular/core';
import { PuiFormDirective } from '@nexplore/practices-ng-forms';
import { getElementFormStates$ } from '../util/form.utils';

@Directive({
    standalone: true,
    selector: '[formGroup][puibeForm]',
    hostDirectives: [
        {
            directive: PuiFormDirective,
            inputs: ['enableDirtyFormNavigationGuard', 'formGroup'],
            outputs: [],
        },
    ],
})
export class PuibeFormDirective {
    private readonly _elementRef = inject(ElementRef<HTMLElement>);
    private readonly _innerDirective = inject(PuiFormDirective);

    /**
     * @deprecated
     *
     * The purpose of this directive was to provide the dirty guard functionality to the containing component.
     * This has been deprecated in favor of the input `enableDirtyFormNavigationGuard`, which enables the dirty guard for the current form with a simple boolean flag.
     */
    @Output()
    readonly formStateChange = getElementFormStates$(this._elementRef.nativeElement);


    public markAsTouched() {
        this._innerDirective.markAsTouched();
    }
}
