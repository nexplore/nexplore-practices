import { describe, expect, it } from '@jest/globals';
import { wrapArrayAndFilterFalsyValues } from './array.util';

describe('wrapArrayAndFilterFalsyValues', () => {
  it('should return empty array for null input', () => {
    const result = wrapArrayAndFilterFalsyValues(null);
    expect(result).toEqual([]);
  });

  it('should return empty array for undefined input', () => {
    const result = wrapArrayAndFilterFalsyValues(undefined);
    expect(result).toEqual([]);
  });

  it('should return empty array for falsy input', () => {
    expect(wrapArrayAndFilterFalsyValues(false)).toEqual([]);
    expect(wrapArrayAndFilterFalsyValues(0)).toEqual([]);
    expect(wrapArrayAndFilterFalsyValues('')).toEqual([]);
    expect(wrapArrayAndFilterFalsyValues(NaN)).toEqual([]);
  });

  it('should wrap a single truthy value in an array', () => {
    expect(wrapArrayAndFilterFalsyValues('test')).toEqual(['test']);
    expect(wrapArrayAndFilterFalsyValues(1)).toEqual([1]);
    expect(wrapArrayAndFilterFalsyValues(true)).toEqual([true]);
    expect(wrapArrayAndFilterFalsyValues({})).toEqual([{}]);
  });

  it('should return the array as is if all items are truthy', () => {
    const input = ['a', 'b', 'c'];
    const result = wrapArrayAndFilterFalsyValues(input);
    expect(result).toEqual(input);
    
    const input2 = [1, 2, 3];
    const result2 = wrapArrayAndFilterFalsyValues(input2);
    expect(result2).toEqual(input2);
  });

  it('should filter out falsy values from an array', () => {
    const input = ['a', '', 'b', null, 'c', undefined, false, 0, NaN];
    const result = wrapArrayAndFilterFalsyValues(input);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should work with mixed types in an array', () => {
    const input = ['string', 1, true, {}, []];
    const result = wrapArrayAndFilterFalsyValues(input);
    expect(result).toEqual(['string', 1, true, {}, []]);
  });

  it('should handle arrays of objects properly', () => {
    const obj1 = { id: 1, name: 'First' };
    const obj2 = { id: 2, name: 'Second' };
    const input = [obj1, null, undefined, obj2];
    const result = wrapArrayAndFilterFalsyValues(input);
    expect(result).toEqual([obj1, obj2]);
  });

  it('should maintain reference equality for array elements', () => {
    const obj = { id: 1 };
    const arr = [obj];
    const result = wrapArrayAndFilterFalsyValues(arr);
    expect(result[0]).toBe(obj); // Same reference
  });
});
