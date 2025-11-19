import { compareObjShallow } from './util';
import { describe, expect, it } from '@jest/globals';

describe('compareObjShallow', () => {
    it('should ignore functions', () => {
        const a = { a: 1, fun: () => {} };
        const b = { a: 1, fun: () => {} };

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeTruthy();
    });

    it('should compare errors', () => {
        const a = { err: new Error('Hello') };
        const b = { err: new Error('Hello') };

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeTruthy();

        b.err = new Error('Another Error');
        const res2 = compareObjShallow(a, b);
        expect(res2).toBeFalsy();
    });

    it('should compare arrays', () => {
        const a = [1, 2, 3];
        const b = [1, 2, 3];

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeTruthy();

        const c = [1, 2, 6];
        const res2 = compareObjShallow(a, c);
        expect(res2).toBeFalsy();
    });

    it('should compare only first level properties', () => {
        const a = { a: 1, b: { x: 1 }, c: [1, 2, 3] };
        const b = { a: 1, b: { x: 1 }, c: [1, 2, 3] };

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeFalsy();

        b.b = a.b;
        b.c = a.c;
        const res2 = compareObjShallow(a, b);
        expect(res2).toBeTruthy();
    });

    it('should compare all properties of first object', () => {
        const a = { a: 1, b: 2, c: 3 };
        const b = { a: 1, b: 2 };

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeFalsy();
    });

    it('should compare all properties of second object', () => {
        const a = { a: 1, b: 2 };
        const b = { a: 1, b: 2, c: 3 };

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeFalsy();
    });

    it('should work when one object is empty', () => {
        const a = { a: 1, b: 2 };
        const b = {};

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeFalsy();
    });

    it('should work when one object is null', () => {
        const a = { a: 1, b: 2 };
        const b = null;

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeFalsy();
    });

    it('should work when both objects are null', () => {
        const a = null;
        const b = null;

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeTruthy();
    });

    it('should work when one object is undefined', () => {
        const a = { a: 1, b: 2 };
        const b = undefined;

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeFalsy();
    });

    it('should work when the first value is not an object', () => {
        const a = 1;
        const b = { a: 1, b: 2 };

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeFalsy();
    });

    it('should work when the second value is not an object', () => {
        const a = { a: 1, b: 2 };
        const b = 1;

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeFalsy();
    });

    it('should only compare properties that are not inherited from the prototype', () => {
        let counter = 0;
        function Base() {
            this.base = counter++;
        }

        function Derived() {}

        Derived.prototype = new Base();

        const a = new Derived();
        a.a = 1;

        const b = new Derived();
        b.a = 1;

        const res1 = compareObjShallow(a, b);
        expect(res1).toBeTruthy();
    });

    it('should compare with custom comparator', () => {
        const a = { a: 1, b: 2, c: 3 };
        const b = { a: 2, b: 3, c: 4 };

        const res1 = compareObjShallow(a, b, undefined, (value1, value2, _key) => {
            return value1 === value2 - 1;
        });
        expect(res1).toBeTruthy();
    });

    it('should compare all properties of first object with custom comparator', () => {
        const a = { a: 1, b: 2, c: 3 };
        const b = { a: 2, b: 3 };

        const res1 = compareObjShallow(a, b, undefined, (value1, value2, _key) => {
            return value1 === value2 - 1;
        });
        expect(res1).toBeFalsy();
    });

    it('should compare all properties of first object with custom comparator, when second object has more properties', () => {
        const a = { a: 1, b: 2 };
        const b = { a: 2, b: 3, c: 3 };

        const res1 = compareObjShallow(a, b, undefined, (value1, value2, _key) => {
            return value1 === value2 - 1;
        });
        expect(res1).toBeFalsy();
    });

    it('should use default comparision when custom comparator returns undefined', () => {
        const a = { a: 1, b: 2 };
        const b = { a: 1, b: 3 };

        const res1 = compareObjShallow(a, b, undefined, (_value1, _value2, key) => {
            if (key === 'b') {
                return true;
            }

            return undefined;
        });

        expect(res1).toBeTruthy();
    });

    it('should accept custom filter', () => {
        const a = { a: 1, _b: 2 };
        const b = { a: 1, _b: 123123, _c: 21331 };

        const res1 = compareObjShallow(a, b, (key) => !key.startsWith('_'));
        expect(res1).toBeTruthy();
    });

    it('should not call custom comparator when filter has not passed', () => {
        const a = { a: 1 };
        const b = { b: 2 };

        const res1 = compareObjShallow(
            a,
            b,
            (_key) => false,
            (_value1, _value2, _key) => {
                return false;
            }
        );

        expect(res1).toBeTruthy();
    });

    it('should work with both filter and custom comparator', () => {
        const a = { a: 1, _b: 2 };
        const b = { a: 2, _b: 123123, _c: 21331 };

        const res1 = compareObjShallow(
            a,
            b,
            (key) => !key.startsWith('_'),
            (value1, value2, _key) => {
                return value1 === value2 - 1;
            }
        );

        expect(res1).toBeTruthy();
    });
});
