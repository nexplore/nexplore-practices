import { inject } from '@angular/core';
import { AsyncValidatorFn, NgControl, ValidatorFn, Validators } from '@angular/forms';
import { combineLatest, distinctUntilChanged, of, skipWhile } from 'rxjs';
import { PuiFormFieldService } from './form-field.service';
import { PuiReadonlyDirective } from './readonly.directive';

export const removeValidatorsOnReadonlyFieldsBehavior =
    (validatorsToPreserve: Array<ValidatorFn | AsyncValidatorFn> = [Validators.required, Validators.requiredTrue]) =>
    (formFieldService: PuiFormFieldService) => {
        const readonlyDirective = inject(PuiReadonlyDirective, { optional: true });
        let _cachedValidators: ValidatorFn[] = [];
        let _cachedAsyncValidators: AsyncValidatorFn[] = [];

        /**
         * Caches the current validators (both sync and async) of the control and removes them.
         */
        const cacheAndRemoveValidators = (ngControl: NgControl): void => {
            if (ngControl?.control) {
                (validatorsToPreserve ?? []).forEach((validator) => {
                    if (ngControl.control?.hasValidator(validator)) {
                        _cachedValidators.push(validator);
                        ngControl.control.removeValidators(validator);
                    }
                    if (ngControl.control?.hasAsyncValidator(validator as AsyncValidatorFn)) {
                        _cachedValidators.push(validator);
                        ngControl.control.removeValidators(validator);
                    }
                });

                if (ngControl.control.validator) {
                    _cachedValidators.push(ngControl.control.validator);
                }

                if (ngControl.control.asyncValidator) {
                    _cachedAsyncValidators.push(ngControl.control.asyncValidator);
                }

                ngControl.control.clearValidators();
                ngControl.control.clearAsyncValidators();
                ngControl.control.updateValueAndValidity();
            }
        };

        /**
         * Reapplies previously cached validators (both sync and async) to the control.
         */
        const reapplyCachedValidators = (ngControl: NgControl): void => {
            if (ngControl?.control) {
                if (_cachedValidators) {
                    ngControl.control.setValidators(_cachedValidators);
                }

                if (_cachedAsyncValidators) {
                    ngControl.control.setAsyncValidators(_cachedAsyncValidators);
                }

                ngControl.control.updateValueAndValidity();

                _cachedValidators = [];
                _cachedAsyncValidators = [];
            }
        };

        return combineLatest([
            readonlyDirective?.isReadonly$ ?? of(false),
            formFieldService.ngControl$,
            formFieldService.status$,
        ])
            .pipe(
                skipWhile(([isReadonly]) => !isReadonly),
                distinctUntilChanged(
                    ([prevIsReadonly, prevNgControl, prevState], [isReadonly, ngControl, state]) =>
                        prevNgControl === ngControl &&
                        prevIsReadonly === isReadonly &&
                        (isReadonly === false || prevState === state)
                ) // only emit if isReadonly changes or if isReadolny is true and the state changes.
            )
            .subscribe(([isReadonly, ngControl]) => {
                if (isReadonly) {
                    cacheAndRemoveValidators(ngControl);
                } else {
                    reapplyCachedValidators(ngControl);
                }
            });
    };
