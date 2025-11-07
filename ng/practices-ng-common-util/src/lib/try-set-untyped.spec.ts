import { describe, expect, it, jest } from '@jest/globals';
import { trySetUntyped } from './try-set-untyped';

describe('trySetUntyped', () => {
  it('should set a property on an object', () => {
    const obj = { name: 'Test' };
    trySetUntyped(obj, 'age', 30);
    expect((obj as any).age).toBe(30);
  });

  it('should update an existing property on an object', () => {
    const obj = { name: 'Test' };
    trySetUntyped(obj, 'name', 'Updated');
    expect((obj as any).name).toBe('Updated');
  });

  it('should do nothing when object is null', () => {
    const obj = null;
    trySetUntyped(obj, 'name', 'Test');
    expect(obj).toBeNull();
  });

  it('should do nothing when object is undefined', () => {
    const obj = undefined;
    trySetUntyped(obj, 'name', 'Test');
    expect(obj).toBeUndefined();
  });

  it('should work with complex objects', () => {
    const obj = { user: { details: {} } };
    trySetUntyped(obj.user.details, 'age', 30);
    expect((obj.user.details as any).age).toBe(30);
  });
});
