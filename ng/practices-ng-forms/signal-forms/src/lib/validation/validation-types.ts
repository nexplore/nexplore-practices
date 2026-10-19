import type { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import type { Falsy } from 'rxjs';
import type { SignalFormGroup } from '../nodes/nodes';
import type { GroupValues } from '../types';

export type ConditionalValidatorResult = ValidatorFn | ValidatorFn[] | Falsy | ValidationErrors;
export type ConditionalAsyncValidatorResult = AsyncValidatorFn | AsyncValidatorFn[] | Falsy;

/** Validators for each control name of a form group. */
export type ValidatorDefinition<TControls> = {
    [key in keyof TControls]?: ValidatorFn | ValidatorFn[];
};

export type BoundValidators<TForm extends SignalFormGroup<any>> = {
    /**
     * Conditional validation based on signals read in the computation.
     *
     * Whenever a signal read in the computation changes, the returned validators replace the previous ones.
     *
     * ```ts
     * email: conditional(() => this.isEmailRequiredSignal() && Validators.required)
     * ```
     */
    conditional: (validatorsComputation: (() => ConditionalValidatorResult) | ValidatorFn[]) => ValidatorFn;
    /**
     * Conditional validation based on the values of the form group.
     *
     * The validators are recomputed whenever a value that was read changes.
     *
     * ```ts
     * confirmPassword: dependent(({ password, confirmPassword }) => password !== confirmPassword && { passwordsMustMatch: true })
     * ```
     */
    dependent: (validators: (formValues: GroupValues<TForm>) => ConditionalValidatorResult) => ValidatorFn;
    /** Adds one or more async validators. */
    async: (...asyncValidators: AsyncValidatorFn[]) => ValidatorFn;
    /** Async validators computed from signals. */
    asyncConditional: (
        validatorsComputation: (() => ConditionalAsyncValidatorResult) | AsyncValidatorFn[]
    ) => ValidatorFn;
};

/** @internal The minimal control surface validators get to see. */
export type ValidatorControl = AbstractControl;
