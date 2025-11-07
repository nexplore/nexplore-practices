import { describe, expect, it, jest } from '@jest/globals';
import { deepMerge } from './deep-merge.util';

describe('deepMerge', () => {
    it('should merge two objects', () => {
        const obj1 = {
            a: 1,
            b: {
                c: 2,
                d: 3,
            },
        };

        const obj2 = {
            b: {
                c: 4,
            },
        };

        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({
            a: 1,
            b: {
                c: 4,
                d: 3,
            },
        });
    });

    it('it should merge deep when first param is undefined', () => {
        const obj1 = undefined;

        const obj2 = {
            isCancellable: true,
            status: { silent: true, statusCategory: 'action-save' },
        };

        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({
            isCancellable: true,
            status: { silent: true, statusCategory: 'action-save' },
        });
    });

    it('should merge deep when second param is undefined', () => {
        const obj1 = {
            isCancellable: true,
            status: { silent: true, statusCategory: 'action-save' },
        };

        const obj2 = undefined;

        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({
            isCancellable: true,
            status: { silent: true, statusCategory: 'action-save' },
        });
    });

    it('should merge even with circular references', () => {
        const obj1: any = {
            a: 1,
            b: {
                c: 2,
                d: 3,
            },
        };

        obj1.b.e = obj1;

        const obj2: any = {
            b: {
                c: 4,
            },
            obj1,
        };

        const result = deepMerge(obj1, obj2);

        expect(result).toEqual({
            a: 1,
            b: {
                c: 4,
                d: 3,
                e: obj1,
            },
            obj1,
        });
    });
});
