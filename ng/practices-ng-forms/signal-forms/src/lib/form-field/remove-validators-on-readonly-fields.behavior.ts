import { effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { of, Subscription } from 'rxjs';
import { NODE_STATE } from '../runtime/node-state';
import type { PuiFormFieldService } from './form-field.service';

/**
 * Makes the field read-only in the signal form while a `puiReadonly` directive above it is set.
 *
 * Signal forms do not validate read-only fields, so unlike the Reactive Forms behavior no validators have to be cached and
 * removed. The `validatorsToPreserve` argument is accepted for source compatibility and has no effect.
 */
export const removeValidatorsOnReadonlyFieldsBehavior =
    (_validatorsToPreserve?: Array<ValidatorFn | AsyncValidatorFn>) => (formFieldService: PuiFormFieldService) => {
        const readonlyDirective = inject(PuiReadonlyDirective, { optional: true });
        const isReadonlySignal = toSignal(readonlyDirective?.isReadonly$ ?? of(false), { initialValue: false });

        const ref = effect(() => {
            const readonly = isReadonlySignal();
            formFieldService.stateSignal()?.metadata(NODE_STATE)?.readonly.set(readonly);
        });
        return new Subscription(() => ref.destroy());
    };
