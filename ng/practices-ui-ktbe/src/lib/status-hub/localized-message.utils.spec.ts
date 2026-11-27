import { describe, expect, it } from '@jest/globals';
import type { TranslateService } from '@ngx-translate/core';
import { resolveLocalizedMessage } from './localized-message.utils';

describe('resolveLocalizedMessage', () => {
    const translate: Pick<TranslateService, 'instant'> = {
        instant: (key, params) => (params ? `${key} ${JSON.stringify(params)}` : `translated ${key}`),
    };

    it('should return plain strings as they are', () => {
        expect(resolveLocalizedMessage(translate, 'Saving...')).toBe('Saving...');
    });

    it('should translate a translation key', () => {
        expect(resolveLocalizedMessage(translate, { key: 'App.Labels_Saving' })).toBe('translated App.Labels_Saving');
    });

    it('should translate a translation key with params', () => {
        expect(resolveLocalizedMessage(translate, { key: 'App.Labels_Saved', params: { name: 'Foo' } })).toBe(
            'App.Labels_Saved {"name":"Foo"}'
        );
    });

    it.each([[true], [false], [null], [undefined], [new Error('Oops')], [{ key: 'App.Labels_Error', status: 500 }]])(
        'should resolve %p to null',
        (value) => {
            expect(resolveLocalizedMessage(translate, value)).toBeNull();
        }
    );
});
