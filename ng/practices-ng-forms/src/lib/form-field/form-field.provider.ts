import type { Provider } from '@angular/core';
import type { NgControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { firstCharToUpper } from '@nexplore/practices-ng-common-util';
import type { PuiFormFieldConfig } from './pui-form-field.config';
import { PUI_FORM_FIELD_CONFIG } from './pui-form-field.config';

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
