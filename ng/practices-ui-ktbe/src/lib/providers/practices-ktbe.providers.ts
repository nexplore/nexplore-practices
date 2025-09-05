import { Provider } from '@angular/core';
import { provideFormStateConfig } from '@nexplore/practices-ng-forms';
import { providePuibeDirtyGuard } from '../dirty-guard/dirty-guard.providers';
import { FORM_CONFIG, FormConfig } from '../form/form.config';
import { PUIBE_MODAL_CONFIG, PuibeModalConfig } from '../popup/types';

type PracticesKtbeConfig = {
    /**
     * Configure theme and functionality aspects of formular related components and services
     */
    forms?: FormConfig;

    /**
     * The config to use for the FormFieldServices.
     *
     * @deprecated Use `forms`
     */
    formFieldServiceConfig?: FormConfig;

    /**
     * Configure theme and functionality aspects of modal related components and services
     */
    modals?: PuibeModalConfig;
};

/**
 * Provides injectables of Practices UI KTBE Component Library.
 *
 * @param {FormConfig?} config - Allows certain behavior or theme aspects of the Ktbe component library.
 * @returns {Provider[]} The providers to be imported by an applcation or module
 *
 * ---------------
 * Configuration example:
 * ```ts
 * import { providePracticesKtbe } from '@nexplore/practices-ui-ktbe';
 * bootstrapApplication(..., {
 *   providers: [
 *       providePractices(),
 *       providePracticesKtbe({forms: { useSmallTextForReadonlyLabel: true }}),
 *       ...
 *   ]
 * });
 * ```
 */
export const providePracticesKtbe = (config?: PracticesKtbeConfig): Provider[] => {
    const providers: Provider[] = [providePuibeDirtyGuard()];

    if (config?.forms ?? config?.formFieldServiceConfig) {
        providers.push({
            provide: FORM_CONFIG,
            useValue: config.forms ?? config.formFieldServiceConfig,
        });
    }

    if (config?.forms && (config?.forms.invalidElementSelector || config?.forms.dirtyElementSelector)) {
        providers.push(provideFormStateConfig(config.forms));
    }

    if (config?.modals) {
        providers.push({
            provide: PUIBE_MODAL_CONFIG,
            useValue: config.modals,
        });
    }

    return providers;
};
