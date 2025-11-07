import { describe, expect, it, jest } from '@jest/globals';
import { signal } from '@angular/core';
import { unwrapSignalLike } from './unwrap-signal-like';

describe('unwrapSignalLike', () => {
  it('should unwrap value from a signal', () => {
    // Create a real Angular signal
    const testSignal = signal('signal value');
    
    // Unwrap should extract the value
    expect(unwrapSignalLike(testSignal)).toBe('signal value');
  });

  it('should call the function and return its value if value is a function', () => {
    const testFunction = () => 'function result';
    expect(unwrapSignalLike(testFunction)).toBe('function result');
    
    // With parameters captured in closure
    const param = 42;
    const testFunctionWithClosure = () => `value ${param}`;
    expect(unwrapSignalLike(testFunctionWithClosure)).toBe('value 42');
  });

  it('should return the value directly if not a function or signal', () => {
    const stringValue = 'direct value';
    expect(unwrapSignalLike(stringValue)).toBe('direct value');
    
    const numberValue = 123;
    expect(unwrapSignalLike(numberValue)).toBe(123);
    
    const objectValue = { test: 'object' };
    expect(unwrapSignalLike(objectValue)).toBe(objectValue);
  });

  it('should handle null and undefined values', () => {
    expect(unwrapSignalLike(null)).toBe(null);
    expect(unwrapSignalLike(undefined)).toBe(undefined);
  });
  
  it('should handle complex scenarios', () => {
    // Test with a function that returns a signal
    const signalValue = signal('nested signal');
    const functionReturningSignal = () => signalValue;
    
    // In this case, it should call the function and return the signal object
    // (not unwrap twice)
    expect(unwrapSignalLike(functionReturningSignal)).toBe(signalValue);
  });
});
