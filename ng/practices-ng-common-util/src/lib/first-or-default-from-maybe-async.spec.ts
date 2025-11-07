import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { firstOrDefaultFromMaybeAsync } from './first-or-default-from-maybe-async';
import { Observable, Subject } from 'rxjs';

// Mock logging
jest.mock('@nexplore/practices-ng-logging', () => ({
  trace: jest.fn()
}));

describe('firstOrDefaultFromMaybeAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the promise directly when input is a promise', async () => {
    const promise = Promise.resolve('test');
    const result = firstOrDefaultFromMaybeAsync(promise, 'default');
    
    expect(result).toBe(promise);
    await expect(result).resolves.toBe('test');
  });

  it('should return first emitted value from observable', async () => {
    const subject = new Subject<string>();
    const result = firstOrDefaultFromMaybeAsync(subject, 'default');
    
    // Emit a value and verify it's returned
    setTimeout(() => subject.next('test'), 10);
    await expect(result).resolves.toBe('test');
  });

  it('should return default value when observable completes without emitting', async () => {
    const observable = new Observable<string>(subscriber => {
      setTimeout(() => subscriber.complete(), 10);
    });
    
    const result = firstOrDefaultFromMaybeAsync(observable, 'default');
    await expect(result).resolves.toBe('default');
  });

  it('should reject when observable errors', async () => {
    const error = new Error('Observable error');
    const observable = new Observable<string>(subscriber => {
      setTimeout(() => subscriber.error(error), 10);
    });
    
    const result = firstOrDefaultFromMaybeAsync(observable, 'default');
    await expect(result).rejects.toThrow(error);
  });

  it('should wrap direct value in resolved promise', async () => {
    const value = 'test';
    const result = firstOrDefaultFromMaybeAsync(value, 'default');
    
    await expect(result).resolves.toBe('test');
  });
});
