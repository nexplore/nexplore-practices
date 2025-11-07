import { Injectable, InjectionToken, inject } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

/**
 * Configuration for the CustomMissingTranslationHandler.
 *
 * @param {string} rewriteResourceConfig.rewriteTypeConfig.key - The resource type to rewrite from.
 * @param {string} rewriteResourceConfig.rewriteTypeConfig.key.rewriteTo - The resource type to rewrite to.
 * @param {string?} [rewriteResourceConfig.rewriteTypeConfig.key.fallbackTo] - The resource type to fallback to if `rewriteTo` does not work
 * @param {(key: string) => string} [rewriteResourceConfig.missingKeyTransformFn] - Optional function that transforms missing key e.g. wraps the key in brackets [{key}]. If not provided, no transformation is applied.
 * @example
 * // Configure the CustomMissingTranslationHandler to rewrite 'Practices' and 'Messages' resource types to 'App' and fallback to 'Shared'.
 * providePractices(
*   rewriteResourceConfig: {
        rewriteTypeConfig: {
            Practices: {
                rewriteTo: 'App',
                fallbackTo: 'Shared',
            },
            Messages: {
                rewriteTo: 'App',
                fallbackTo: 'Shared',
            },
        },
        missingKeyTransformFn: (key: string) => `[${key}]`,
    },
 * )
 */
export type RewriteResourceConfig = {
    rewriteTypeConfig: {
        [key: string]: {
            rewriteTo: string;
            fallbackTo?: string;
        };
    };
    missingKeyTransformFn?: (key: string) => string;
};

export const REWRITE_RESOURCE_CONFIG = new InjectionToken<RewriteResourceConfig>('RewriteResourceTypesConfig');

@Injectable()
export class RewriteMissingTranslationHandler extends MissingTranslationHandler {
    private readonly _rewriteConfigs = inject<RewriteResourceConfig>(REWRITE_RESOURCE_CONFIG);


    public override handle(params: MissingTranslationHandlerParams) {
        const rewriteConfig = this._rewriteConfigs?.rewriteTypeConfig;
        const key = params.key;

        if (rewriteConfig) {
            const segments = key.split('.');
            const prefix = segments.length > 0 ? segments[0] : undefined;

            if (prefix && rewriteConfig[prefix]) {
                const keyWithoutPrefix = segments.slice(1).join('.');

                const { rewriteTo, fallbackTo } = rewriteConfig[prefix];

                if (rewriteTo) {
                    const newKey = `${rewriteTo}.${keyWithoutPrefix}`;
                    const result = params.translateService.instant(newKey, params.interpolateParams);
                    if (this._isDefinedAndNotMissing(result, newKey)) {
                        return result;
                    }
                }

                if (fallbackTo) {
                    const newKey = `${fallbackTo}.${keyWithoutPrefix}`;
                    const result = params.translateService.instant(newKey, params.interpolateParams);
                    if (this._isDefinedAndNotMissing(result, newKey)) {
                        return result;
                    }
                }
            }
        }

        return this._formatMissingKey(params.key);
    }

    private _formatMissingKey(key: string) {
        const transformFn = this._rewriteConfigs?.missingKeyTransformFn;
        return transformFn ? transformFn(key) : key;
    }

    private _isDefinedAndNotMissing(value: string, prev: string): boolean {
        return typeof value !== 'undefined' && value !== null && value !== this._formatMissingKey(prev);
    }
}
