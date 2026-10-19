import { DecimalPipe } from '@angular/common';
import { Directive, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { PuiMarkControlService, PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { of } from 'rxjs';
import { PuiFormFieldService } from './form-field.service';

/**
 * Directive that provides form field behavior.
 *
 * Place it on the element that wraps a control bound with `[formField]`; the `[formField]` directive registers itself
 * with the closest form field service (see `PuiFormFieldControlDirective`).
 */
@Directive({
    selector: '[puiFormField]',
    providers: [PuiFormFieldService, DecimalPipe],
    standalone: true,
})
export class PuiFormFieldDirective {
    private readonly _formFieldService = inject(PuiFormFieldService);
    private readonly _readonlyDirective = inject(PuiReadonlyDirective, { optional: true });

    protected readonly stateSignal = this._formFieldService.stateSignal;

    public readonly isReadonlySignal = toSignal(this._readonlyDirective?.isReadonly$ ?? of(false));

    public constructor() {
        const markControlService = inject(PuiMarkControlService, { optional: true });
        markControlService?.touched$.pipe(takeUntilDestroyed()).subscribe(() => {
            this._formFieldService.markAsTouched();
        });
    }
}
