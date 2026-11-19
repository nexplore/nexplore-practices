import { expect, describe, it } from '@jest/globals';
import { compareUrlWithWildcards, isDefinedAndNotEmptyArray, splitArrayChunks, trimChars } from './utils';

describe('trimChars', () => {
    it('should trim /test', () => {
        const str = '/test';

        const trimmed = trimChars(str, '/');
        expect(trimmed).toEqual('test');
    });
    it('should trim test/', () => {
        const str = 'test/';

        const trimmed = trimChars(str, '/');
        expect(trimmed).toEqual('test');
    });
    it('should trim /test/', () => {
        const str = '/test/';

        const trimmed = trimChars(str, '/');
        expect(trimmed).toEqual('test');
    });
});

describe('compareUrlWithWildcards', () => {
    it('should compare with * at end', () => {
        const url = '/abc/abc/1234';
        const match = compareUrlWithWildcards(url, '/abc/abc/*');
        expect(match).toEqual(true);
    });
    it('should compare with :param at end', () => {
        const url = '/abc/abc/1234';
        const match = compareUrlWithWildcards(url, '/abc/abc/:param');
        expect(match).toEqual(true);
    });
    it('should compare with :param in between', () => {
        const url = '/abc/abc/1234/abc';
        const match = compareUrlWithWildcards(url, '/abc/abc/:param/abc');
        expect(match).toEqual(true);
    });
    it('should not compare with :param and different path', () => {
        const url = '/abc/abc/1234';
        const match = compareUrlWithWildcards(url, '/:param');
        expect(match).toEqual(false);
    });
});

describe('splitArrayChunks', () => {
    it('Should split the array into chunks', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const chunks = splitArrayChunks(array, 3);
        expect(chunks).toEqual([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ]);
    });
    it('Should split the array into bigger chunks', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        const chunks = splitArrayChunks(array, 7);
        expect(chunks).toEqual([
            [1, 2, 3, 4, 5, 6, 7],
            [8, 9, 10, 11, 12, 13, 14],
        ]);
    });

    it('Should split the array into chunks with missing trail', () => {
        const array = [1, 2, 3, 4, 5, 6, 7, 8];
        const chunks = splitArrayChunks(array, 3);
        expect(chunks).toEqual([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8],
        ]);
    });
});

describe('isDefinedAndNotEmptyArray', () => {
    it('should return true for a defined value', () => {
        const value = 1;
        const result = isDefinedAndNotEmptyArray(value);
        expect(result).toBe(true);
    });

    it('should return true for a non empty object', () => {
        const exampleObject = { foo: true, bar: false };
        const result = isDefinedAndNotEmptyArray(exampleObject);
        expect(result).toBe(true);
    });

    it('should return true for a defined and non-empty array', () => {
        const exampleArray = [1, 2, 3];
        const result = isDefinedAndNotEmptyArray(exampleArray);
        expect(result).toBe(true);
    });

    it('should return false for an undefined value', () => {
        const result = isDefinedAndNotEmptyArray(undefined);
        expect(result).toBe(false);
    });

    it('should return false for a null value', () => {
        const result = isDefinedAndNotEmptyArray(null);
        expect(result).toBe(false);
    });

    it('should return false for an empty array', () => {
        const result = isDefinedAndNotEmptyArray([]);
        expect(result).toBe(false);
    });

    it('should return false for an empty object', () => {
        const result = isDefinedAndNotEmptyArray({});
        expect(result).toBe(false);
    });
});
