/**
 * A message that is resolved via a translation key (e.g. with `@ngx-translate/core`) by the UI rendering it.
 */
export interface TranslatableMessage {
    /**
     * The translation key to use.
     */
    key: string;

    /**
     * Optional interpolation parameters to use for the translation.
     */
    params?: Record<string, unknown>;
}

/**
 * A message shown to the user, either as plain text or as a translation key with optional parameters.
 *
 * @example
 * 'Saving...'
 * { key: 'MyApp.Labels_Saving' }
 * { key: 'MyApp.Labels_Saved', params: { name: 'Foo' } }
 */
export type LocalizedMessage = string | TranslatableMessage;

const translatableMessageKeys = ['key', 'params'];

/**
 * Checks whether the given value is a {@link TranslatableMessage}: an object with a translation `key`, optional `params` and no other properties
 * (internal markers prefixed with `_`, which the status hub may attach, are ignored).
 */
export function isTranslatableMessage(value: unknown): value is TranslatableMessage {
    if (!value || typeof value !== 'object' || Array.isArray(value) || value instanceof Error) {
        return false;
    }

    const message = value as Partial<TranslatableMessage>;
    return (
        typeof message.key === 'string' &&
        (message.params === undefined || (typeof message.params === 'object' && message.params !== null)) &&
        Object.keys(message).every((key) => translatableMessageKeys.includes(key) || key.startsWith('_'))
    );
}

/**
 * Checks whether the given value is a {@link LocalizedMessage} (a string or a {@link TranslatableMessage}).
 */
export function isLocalizedMessage(value: unknown): value is LocalizedMessage {
    return typeof value === 'string' || isTranslatableMessage(value);
}
