import { describe, expect, it, jest } from '@jest/globals';
import { signal } from '@angular/core';
import { unwrapSignal } from './unwrap-signal';

describe('unwrapSignal', () => {
  it('should unwrap value from a signal', () => {
    // Create a real Angular signal
    const testSignal = signal('test value');
    
    // Unwrap should extract the value
    expect(unwrapSignal(testSignal)).toBe('test value');
    
    // Update the signal value
    testSignal.set('updated value');
    
    // Should get the updated value
    expect(unwrapSignal(testSignal)).toBe('updated value');
  });

  it('should return the value directly if not a signal', () => {
    const simpleValue = 'not a signal';
    expect(unwrapSignal(simpleValue)).toBe('not a signal');
    
    const numberValue = 42;
    expect(unwrapSignal(numberValue)).toBe(42);
    
    const objectValue = { key: 'value' };
    expect(unwrapSignal(objectValue)).toBe(objectValue);
  });

  it('should handle null and undefined values', () => {
    expect(unwrapSignal(null)).toBe(null);
    expect(unwrapSignal(undefined)).toBe(undefined);
  });
});
