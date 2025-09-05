import { describe, expect, it } from '@jest/globals';
import { firstValueFromMaybeAsync } from './first-value-from-maybe-async';
import { of, Subject } from 'rxjs';

describe('firstValueFromMaybeAsync', () => {
  it('should return the promise directly when input is a promise', async () => {
    const promise = Promise.resolve('test');
    const result = firstValueFromMaybeAsync(promise);
    
    expect(result).toBe(promise);
    await expect(result).resolves.toBe('test');
  });

  it('should convert observable to promise with first value', async () => {
    const observable = of('test');
    const result = firstValueFromMaybeAsync(observable);
    
    await expect(result).resolves.toBe('test');
  });

  it('should handle observable that emits multiple values', async () => {
    const subject = new Subject<string>();
    const result = firstValueFromMaybeAsync(subject);
    
    // Schedule emissions
    setTimeout(() => {
      subject.next('first');
      subject.next('second');
      subject.complete();
    }, 0);
    
    // Should resolve with the first emitted value
    await expect(result).resolves.toBe('first');
  });

  it('should wrap the value in a resolved promise when input is a direct value', async () => {
    const value = 'test';
    const result = firstValueFromMaybeAsync(value);
    
    await expect(result).resolves.toBe('test');
  });
});
