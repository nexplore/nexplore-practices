import { Provider } from '@angular/core';

export interface IFormState {
    dirty: boolean;
    valid: boolean;
}

export const FORM_STATE_EMPTY: IFormState = {
    dirty: false,
    valid: true,
};

export class PuiFormStateConfig {
    invalidElementSelector?: string;
    dirtyElementSelector?: string;
}

export const INVALID_CONTROL_DEFAULT_SELECTOR =
    ':is(select,input,textarea).ng-invalid, .ng-invalid:not(form):not([formGroup]) :is(select,input,textarea)';

export const DIRTY_CONTROL_DEFAULT_SELECTOR =
    ':is(select,input,textarea).ng-dirty, .ng-dirty:not(form):not([formGroup]) :is(select,input,textarea)';

export function provideFormStateConfig(config: Partial<PuiFormStateConfig>): Provider {
    return {
        provide: PuiFormStateConfig,
        useValue: Object.assign(new PuiFormStateConfig(), config),
    };
}

/**
 * Throwing this error will show a simple Error-Toast, telling the user a formular has invalid changes
 */
export class PuiFormularInvalidError extends Error {
    readonly $type = 'PuiFormularInvalidError';

    readonly displayOptions = {
        hideTechnicalDetails: true,
    };
}
