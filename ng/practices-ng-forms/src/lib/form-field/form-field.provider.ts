import { Provider } from '@angular/core';
import { NgControl, Validators } from '@angular/forms';
import { firstCharToUpper } from '@nexplore/practices-ng-common-util';
import { PUI_FORM_FIELD_CONFIG, PuiFormFieldConfig } from './pui-form-field.config';

export const FORM_FIELD_CONFIG_DEFAULTS: PuiFormFieldConfig = {
    hideInvalidIfUntouched: false,
    mapErrorsToTranslationParamsFn: (errors) => {
        if (errors == null) {
            return [];
        }

        return Object.entries(errors)
            .map(([key, value]) => [firstCharToUpper(key), value] as const)
            .map(([key, value]) => ({
                key: `Messages.Validation_${key}`,
                param: value,
            }));
    },
    shouldShowOptionalFlagFn: (ngControl: NgControl) =>
        !(
            ngControl.control?.hasValidator(Validators.required) ||
            ngControl.control?.hasValidator(Validators.requiredTrue)
        ),
    behaviors: [],
};

export function providePuiFormFieldConfig(config: Partial<PuiFormFieldConfig>): Provider {
    return {
        provide: PUI_FORM_FIELD_CONFIG,
        useValue: { ...FORM_FIELD_CONFIG_DEFAULTS, config },
    };
}
