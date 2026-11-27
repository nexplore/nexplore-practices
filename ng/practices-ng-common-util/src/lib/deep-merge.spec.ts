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

    it('should merge/override function properties', () => {
        const fn1 = () => 'one';
        const fn2 = () => 'two';

        const base: any = { compute: fn1, value: 1 };
        const incoming: any = { compute: fn2, other: 3 };

        const result: any = deepMerge(base, incoming as any);

        expect(result.compute).toBe(fn2);
        expect(result.other).toBe(3);
        // original still untouched (pure-ish behaviour for replaced fn)
        expect(base.compute).toBe(fn1);
    });

    it('should replace arrays (no deep merge)', () => {
        const base = {
            arr: [{ x: 1 }, { y: 2 }],
            arr2: [1, 2, 3],
        } as any;
        const incoming = {
            arr: [{ x: 10 }, { z: 20 }],
            arr2: [9],
        } as any;

        const result: any = deepMerge(base, incoming);
        expect(result.arr).toBe(incoming.arr);
        expect(result.arr2).toBe(incoming.arr2);
    });

    it('should replace Date instance', () => {
        const date1 = new Date('2020-01-01T00:00:00Z');
        const date2 = new Date('2021-01-01T00:00:00Z');
        const base = { created: date1 };
        const incoming = { created: date2 };
        const result = deepMerge(base, incoming);
        expect(result.created).toBe(date2);
    });

    it('should replace Map/Set references', () => {
        const map1 = new Map<string, number>([['a', 1]]);
        const map2 = new Map<string, number>([
            ['a', 2],
            ['b', 3],
        ]);
        const set1 = new Set<number>([1, 2]);
        const set2 = new Set<number>([3]);

        const base = { map: map1, set: set1 } as any;
        const incoming = { map: map2, set: set2 } as any;

        const result = deepMerge(base, incoming);
        expect(result.map).toBe(map2);
        expect(result.set).toBe(set2);
    });

    it('should not update symbol keyed properties (Object.entries ignores symbols)', () => {
        const sym = Symbol('id');
        const base: any = { [sym]: 1 };
        const incoming: any = { [sym]: 2 };

        const result = deepMerge(base, incoming);
        expect(result[sym]).toBe(1);
    });

    it('should overwrite a previously non-writable property (top-level clone loses descriptor)', () => {
        const base: any = {};
        Object.defineProperty(base, 'immutable', {
            value: 1,
            writable: false,
            configurable: false,
            enumerable: true,
        });
        const result: any = deepMerge(base, { immutable: 2 } as any);
        // After spread, descriptor is lost -> writable, so value is overwritten
        expect(result.immutable).toBe(2);
    });

    it('should overwrite a getter-only (accessor) property (value materialized)', () => {
        const base: any = {};
        Object.defineProperty(base, 'computed', {
            get: () => 5,
            enumerable: true,
            configurable: true,
        });
        const result: any = deepMerge(base, { computed: 10 } as any);
        // Getter is invoked during spread; becomes data prop => overwritten
        expect(result.computed).toBe(10);
    });

    it('should replace frozen array with new reference', () => {
        const frozenArray = Object.freeze([1, 2, 3]);
        const base: any = { arr: frozenArray };
        const incoming: any = { arr: [9] };
        const result: any = deepMerge(base, incoming);
        expect(result.arr).toBe(incoming.arr);
        expect(base.arr).toBe(frozenArray); // original untouched
    });

    it('should not mutate nested objects of the inputs', () => {
        const defaults = { status: { silent: true, title: 'a' } };
        const overrides = { status: { title: 'b' } };

        const result = deepMerge<{ status: { silent: boolean; title: string } }>(defaults, overrides);

        expect(result).toEqual({ status: { silent: true, title: 'b' } });
        expect(defaults).toEqual({ status: { silent: true, title: 'a' } });
        expect(overrides).toEqual({ status: { title: 'b' } });
    });
});
