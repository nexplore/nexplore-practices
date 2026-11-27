import { isTranslatableMessage } from '@nexplore/practices-ng-status';
import type { TranslateService } from '@ngx-translate/core';

/**
 * Resolves a `LocalizedMessage` to the text to display.
 *
 * Plain strings are returned as they are, translation keys (`{ key, params }`) are translated with the given `TranslateService`.
 * Any other value (e.g. `true`, `null` or an error object) resolves to `null`.
 *
 * @internal
 */
export function resolveLocalizedMessage(translate: Pick<TranslateService, 'instant'>, message: unknown): string | null {
    if (typeof message === 'string') {
        return message;
    }

    if (isTranslatableMessage(message)) {
        return translate.instant(message.key, message.params);
    }

    return null;
}
