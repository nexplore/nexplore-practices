import { InjectionToken } from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PuiFormFieldService } from './form-field.service';

export type PuiFormFieldBehavior = (service: PuiFormFieldService) => Subscription | void;

export type PuiFormFieldConfig = {
    /**
     * If true, validation errors will be hidden if the field is untouched.
     */
    hideInvalidIfUntouched: boolean;

    /**
     * Function to map validation errors to a translation key and a interpolation parameters object.
     */
    mapErrorsToTranslationParamsFn: (errors: ValidationErrors | null) => { key: string; param: any }[];

    /**
     * Function to determine if the optional flag should be shown for a form field control.
     * By default, it will be always shown, unless the control has the `Validators.required` validator.
     * Attention: don't forget to also adjust `validatorsToPreserve` if you are using `hasValidator()` with another ValidatorFn.
     */
    shouldShowOptionalFlagFn: (control: NgControl) => boolean;

    /**
     * An array of behaviours which will be added to the FormFieldService if needed.
     * These behaviors can be used to modify the behavior of the form field, for example removing validators on readonly fields if the Readonly flag is set or adding custom validation logic based on the form field's state.
     * Each behavior is a function that takes the FormFieldService as an argument and returns a Subscription or void.
     */
    behaviors: Array<PuiFormFieldBehavior>;
};

export const PUI_FORM_FIELD_CONFIG = new InjectionToken<PuiFormFieldConfig>('PuiFormFieldConfig');
