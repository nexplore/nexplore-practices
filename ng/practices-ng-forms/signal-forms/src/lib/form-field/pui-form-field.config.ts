import { InjectionToken } from '@angular/core';
import type { ValidationErrors } from '@angular/forms';
import type { FieldState } from '@angular/forms/signals';
import type { Subscription } from 'rxjs';
import type { PuiFormFieldService } from './form-field.service';

export type PuiFormFieldBehavior = (service: PuiFormFieldService) => Subscription | void;

export type PuiFormFieldConfig = {
    /**
     * If true, validation errors will be hidden if the field is untouched.
     */
    hideInvalidIfUntouched: boolean;

    /**
     * Function to map validation errors (as `ValidationErrors` record, see the error model) to a translation key and a interpolation parameters object.
     */
    mapErrorsToTranslationParamsFn: (errors: ValidationErrors | null) => { key: string; param: any }[];

    /**
     * Function to determine if the optional flag should be shown for a form field control.
     * By default, it will be always shown, unless the field state is `required`.
     */
    shouldShowOptionalFlagFn: (state: FieldState<unknown>) => boolean;

    /**
     * An array of behaviours which will be added to the FormFieldService if needed.
     * Each behavior is a function that takes the FormFieldService as an argument and returns a Subscription or void.
     */
    behaviors: Array<PuiFormFieldBehavior>;
};

export const PUI_FORM_FIELD_CONFIG = new InjectionToken<PuiFormFieldConfig>('PuiSignalFormFieldConfig');
