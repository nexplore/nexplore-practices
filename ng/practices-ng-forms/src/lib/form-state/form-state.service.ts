import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MaybeAsync } from '@angular/router';
import { firstValueFromMaybeAsync } from '@nexplore/practices-ng-common-util';
import { PuiGlobalRouteGuardService } from '@nexplore/practices-ng-dirty-guard';
import { log, trace } from '@nexplore/practices-ng-logging';
import { finalize, Observable } from 'rxjs';
import { getPuiFormDirectiveForFormGroup } from '../form-field/form.directive';

import { markAllAsTouched } from '../utils/mark-all-as-touched';
import { focusFirstInvalidControl } from './focus-first-invalid-control-util';
import { IFormState, PuiFormStateConfig, PuiFormularInvalidError } from './form-state.types';

type ValidityCheckOptions = {
    /**
     * Callback that is called if the form state is valid, before any other action is taken.
     */
    validCallback?: () => void;

    /**
     * Skip the validation check and just disable the dirty guard.
     */
    skipValidation?: boolean;

    /**
     * This element will be used as the container to search for the first invalid control, when the form is invalid.
     * By default the `main` element is used, and if not found the `body` element.
     */
    formContainerElement?: Element | null;
};

@Injectable({
    providedIn: 'root',
})
export class PuiFormStateService {
    private _globalRouteGuardService = inject(PuiGlobalRouteGuardService);
    private _config = inject(PuiFormStateConfig, { optional: true });

    private _isLocked = false;

    /**
     * Disable the dirty guard.
     */
    disableDirtyGuard(disabled: boolean): void {
        log('app', 'disableDirtyGuard', disabled);
        this._globalRouteGuardService.disabled = disabled;
    }

    /**
     * Run a function without the dirty guard enabled.
     * Use this when you need to navigate away from a page without the dirty guard being triggered.
     */
    runWithoutDirtyGuard<T>(fn: () => T): T {
        const previouslyDisabled = this._globalRouteGuardService.disabled;
        this.disableDirtyGuard(true);
        log('app', 'runWithoutDirtyGuard', { previouslyDisabled });
        try {
            const res = fn();
            if (res instanceof Promise) {
                return res.finally(() => this.disableDirtyGuard(previouslyDisabled)) as T;
            } else if (res instanceof Observable) {
                return res.pipe(finalize(() => this.disableDirtyGuard(previouslyDisabled))) as T;
            } else {
                this.disableDirtyGuard(previouslyDisabled);
                return res;
            }
        } catch (err) {
            this.disableDirtyGuard(previouslyDisabled);
            throw err;
        }
    }

    /**
     * Calls the provided function if the provided form state is dirty and valid.
     *
     * Makes sure the dirty guard is disabled after the save function is called.
     *
     * Throws a `FormularInvalidError` if the form state is not valid.
     *
     * @param formState The form state to check. Can be an `FormGroup` or also just a POJO containing dirty and valid state.
     * @param fn The function to call if the form state is valid.
     * @param options Options for the validity check.
     */
    runWithFormValidityCheck = async <T>(
        formState: IFormState,
        fn: () => MaybeAsync<T>,
        options?: ValidityCheckOptions
    ): Promise<T> => {
        try {
            trace('FormStateService', 'wrapSaveWithDirtyAndFormularErrors', { formState, options });
            if (!this._isLocked) {
                this.checkFormValidityAndDisableDirtyGuard(formState, options);
            }

            return await firstValueFromMaybeAsync(fn());
        } finally {
            if (this._isLocked) {
                this.reenableDirtyGuard();
            }
        }
    };

    /**
     * Call this before a save operation, the dirty guard will be disabled and it will check if the form is dirty and valid. If not it will throw a `FormularInvalidError`.
     *
     * Normally you would use `runWithFormValidityCheck` instead of this function.
     */
    checkFormValidityAndDisableDirtyGuard = (formState: IFormState, options?: ValidityCheckOptions): boolean => {
        trace('FormStateService', 'onBeforeSave', { formState });
        this._isLocked = true;
        const valid = this._getIsFormStateValid(formState);
        if (options?.skipValidation || (formState.dirty && valid)) {
            options?.validCallback?.();
            this.disableDirtyGuard(true);

            return true;
        } else if (!valid) {
            setTimeout(() => {
                if (formState instanceof FormGroup) {
                    markAllAsTouched(formState);
                }

                // Find the first invalid control and bring it into view
                focusFirstInvalidControl({
                    selector: this._config?.invalidElementSelector,
                    container: options?.formContainerElement,
                });
            }, 200);

            // This shows an generic formular invalid message.
            throw new PuiFormularInvalidError();
        } else {
            trace('FormStateService', 'valid and pristine');
            return false;
        }
    };

    /**
     * Call this after a save operation. It will enable the dirty guard again.
     *
     * Normally you would use `runWithFormValidityCheck` instead of this function.
     */
    reenableDirtyGuard = (): void => {
        trace('FormStateService', 'onAfterSave');
        this._isLocked = false;
        this.disableDirtyGuard(false);
    };

    private _getIsFormStateValid(formState: IFormState): boolean {
        const attachedDirective = getPuiFormDirectiveForFormGroup(formState);
        if (attachedDirective) {
            return attachedDirective.getIfAllRenderedControlsAreValid();
        }

        return formState.valid;
    }
}
