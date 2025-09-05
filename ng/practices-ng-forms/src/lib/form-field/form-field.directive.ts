import { DecimalPipe } from '@angular/common';
import { Directive, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { PuiFormFieldService } from './form-field.service';
import { PuiMarkControlService } from './mark-control.service';
import { PuiReadonlyDirective } from './readonly.directive';

/**
 * Directive that provides form field behavior.
 */
@Directive({
    selector: '[puiFormField]',
    providers: [PuiFormFieldService, DecimalPipe],
    standalone: true,
})
export class PuiFormFieldDirective {
    private readonly _formFieldService = inject(PuiFormFieldService);
    private readonly _readonlyDirective = inject(PuiReadonlyDirective, { optional: true });

    protected readonly ngControlSignal = toSignal(this._formFieldService.ngControl$);

    public readonly isReadonlySignal = toSignal(this._readonlyDirective?.isReadonly$ ?? of(false));

    public constructor() {
        const markControlService = inject(PuiMarkControlService, { optional: true });
        markControlService?.touched$.pipe(takeUntilDestroyed()).subscribe(() => {
            this._formFieldService.markAsTouched();
        });
    }
}
