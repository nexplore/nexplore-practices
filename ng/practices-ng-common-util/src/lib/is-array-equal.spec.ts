import { describe, expect, it, jest } from '@jest/globals';
import { isArrayEqual } from './is-array-equal';

describe('isArrayEqual', () => {
  it('should return true for identical arrays', () => {
    expect(isArrayEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isArrayEqual(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(true);
    expect(isArrayEqual([], [])).toBe(true);
  });

  it('should return false for arrays with different values', () => {
    expect(isArrayEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(isArrayEqual(['a', 'b', 'c'], ['a', 'b', 'd'])).toBe(false);
  });

  it('should return false for arrays with different lengths', () => {
    expect(isArrayEqual([1, 2, 3], [1, 2])).toBe(false);
    expect(isArrayEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(isArrayEqual([], [1])).toBe(false);
  });

  it('should compare object references, not values', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 1 };
    const arr1 = [obj1];
    const arr2 = [obj2];
    const arr3 = [obj1];

    // Different object references with same values
    expect(isArrayEqual(arr1, arr2)).toBe(false);
    
    // Same object reference
    expect(isArrayEqual(arr1, arr3)).toBe(true);
  });
});
