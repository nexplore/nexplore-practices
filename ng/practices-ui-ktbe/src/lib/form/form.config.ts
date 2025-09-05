import { InjectionToken, Provider } from '@angular/core';
import {
    providePuiFormFieldConfig,
    PUI_FORM_FIELD_CONFIG,
    PuiFormFieldConfig,
    PuiFormStateConfig,
} from '@nexplore/practices-ng-forms';

export type FormConfig = Partial<PuiFormFieldConfig> &
    Partial<PuiFormStateConfig> & {
        /**
         * If true, the search icon will be used for searchable select fields instat of the arrow icon.
         */
        useSearchIconIfSelectSearchable?: boolean;

        /**
         * If true, readonly form fields will have a small label text style by default
         */
        useSmallTextForReadonlyLabel?: boolean;
    };

export const FORM_CONFIG = PUI_FORM_FIELD_CONFIG as InjectionToken<FormConfig>;

export function providePuibeFormConfig(config: Partial<FormConfig>): Provider {
    return providePuiFormFieldConfig(config);
}
