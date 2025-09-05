import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
import { FormGroupValues } from '../utils/form.types';
import { ConditionalValidatorResult } from './validation-internal.util';
import { validateAsync, validateAsyncConditional, validateConditional } from './validators';

export type ValidatorDefinition<TControls extends { [K in keyof TControls]: AbstractControl<any, any> }> = {
    [key in keyof TControls]: ValidatorFn | ValidatorFn[];
};

export type BoundValidators<TForm extends FormGroup> = {
    /**
     * Conditional validation based on a effect computation.
     *
     * Whenever the validators change, the previous ones will be removed.
     *
     * Example:
     * ```ts
     * // This is just a example signal
     * readonly isEmailRequiredSignal = input(false, { alias: 'isEmailRequired' });
     *
     * readonly registrationForm = withEffects(
     *  new FormGroup({
     *     email: new FormControl<string | null>(null),
     *  });
     *  form => {
     *   configureFormValidationsEffect(form, ({conditional}) => ({
     *     email: conditional(() => this.isEmailRequiredSignal() && Validators.required),
     *    })
     *   );
     *  }
     * );
     * ```
     *
     * @param validatorsComputation A function that will be run as a effect, and should return the validators to add, or null/false if none.
     */
    conditional: typeof validateConditional;
    /**
     * Conditional validation based on the values of the form group.
     *
     * Every property that is read within the `validators` function, will create a signal that will recompute the validators whenever the value changes.
     *
     * Whenever the validators change, the previous ones will be removed.
     *
     * Example:
     * ```ts
     * readonly formGroup = withEffects(
     *   new FormGroup({
     *     email: new FormControl<string | null>(null),
     *     isEmailRequired: new FormControl<boolean>(false),
     *   }),
     *   form => {
     *     configureFormValidationsEffect(form, ({dependent}) => ({
     *       email: dependent(value => value.isEmailRequired && [Validators.required]), // Validator is computed whenever `isEmailRequired` changes
     *      })
     *     )
     *   }
     * );
     * ```
     */
    dependent: (validators: (formValues: FormGroupValues<TForm>) => ConditionalValidatorResult) => ValidatorFn;
    async: typeof validateAsync;
    asyncConditional: typeof validateAsyncConditional;
};
