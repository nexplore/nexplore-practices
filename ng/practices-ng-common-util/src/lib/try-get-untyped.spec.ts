import { describe, expect, it, jest } from '@jest/globals';
import { tryGetUntyped } from './try-get-untyped';

describe('tryGetUntyped', () => {
  it('should get a property from an object', () => {
    const obj = { name: 'Test', age: 30 };
    expect(tryGetUntyped<string>(obj, 'name')).toBe('Test');
    expect(tryGetUntyped<number>(obj, 'age')).toBe(30);
  });

  it('should return undefined for non-existent property', () => {
    const obj = { name: 'Test' };
    expect(tryGetUntyped<string>(obj, 'address')).toBeUndefined();
  });

  it('should return undefined when object is null', () => {
    const obj = null;
    expect(tryGetUntyped<string>(obj, 'name')).toBeUndefined();
  });

  it('should return undefined when object is undefined', () => {
    const obj = undefined;
    expect(tryGetUntyped<string>(obj, 'name')).toBeUndefined();
  });

  it('should work with nested properties using bracket notation', () => {
    const obj = { user: { details: { name: 'Test' } } };
    expect(tryGetUntyped<string>(obj.user.details, 'name')).toBe('Test');
  });
});
