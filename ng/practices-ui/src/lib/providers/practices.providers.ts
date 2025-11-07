import { Provider } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { MissingTranslationHandler } from '@ngx-translate/core';
import {
    REWRITE_RESOURCE_CONFIG,
    RewriteMissingTranslationHandler,
    RewriteResourceConfig,
    TITLE_SERVICE_CONFIG,
    TitleService,
    TitleServiceConfig,
} from '../services';

/**
 * Provides injectables of Practices UI.
 *
 * @param {Object} [config] - Optional configuration object.
 * @param {RewriteResourceConfig} [config.rewriteResourceConfig] - Configuration for rewriting resource types and transforming missing translation keys.
 * @param {TitleServiceConfig} [config.titleServiceConfig] - Configuration for the TitleService.
 * @returns {Provider[]} The providers.
 */
export const providePractices = (config?: {
    rewriteResourceConfig?: RewriteResourceConfig;
    titleServiceConfig?: TitleServiceConfig;
}): Provider[] => {
    const providers: Provider[] = [];

    // Only use the RewriteTranslateParser if the config is provided.
    if (config?.rewriteResourceConfig) {
        providers.push({
            provide: REWRITE_RESOURCE_CONFIG,
            useValue: config.rewriteResourceConfig,
        });

        providers.push(RewriteMissingTranslationHandler);
        providers.push({
            provide: MissingTranslationHandler,
            useExisting: RewriteMissingTranslationHandler,
        });
    }

    const titleServiceConfig = config?.titleServiceConfig ?? {
        titleTransformer: null,
        autoSetBreadcrumbTitle: true,
        localize: true,
    };

    providers.push({
        provide: TITLE_SERVICE_CONFIG,
        useValue: titleServiceConfig,
    });

    // Since we want to access the TitleService API we need to provide it separately,
    // as well as override the default TitleStrategy with it (useExisting).
    providers.push(TitleService);
    providers.push({
        provide: TitleStrategy,
        useExisting: TitleService,
    });

    return providers;
};
