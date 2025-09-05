import { describe, expect, it } from '@jest/globals';
import { maybeAsyncToObservable } from './maybe-async-to-observable';
import { firstValueFrom, of } from 'rxjs';

describe('maybeAsyncToObservable', () => {
  it('should return the same observable when input is an observable', async () => {
    const source$ = of('test');
    const result$ = maybeAsyncToObservable(source$);
    
    expect(result$).toBe(source$);
    const value = await firstValueFrom(result$);
    expect(value).toBe('test');
  });

  it('should convert a promise to an observable', async () => {
    const promise = Promise.resolve('test');
    const result$ = maybeAsyncToObservable(promise);
    
    const value = await firstValueFrom(result$);
    expect(value).toBe('test');
  });

  it('should convert a direct value to an observable', async () => {
    const value = 'test';
    const result$ = maybeAsyncToObservable(value);
    
    const emittedValue = await firstValueFrom(result$);
    expect(emittedValue).toBe('test');
  });

  it('should handle rejected promises', async () => {
    const error = new Error('Promise error');
    const promise = Promise.reject(error);
    const result$ = maybeAsyncToObservable(promise);
    
    try {
      await firstValueFrom(result$);
      fail('Should have thrown an error');
    } catch (e) {
      expect(e).toBe(error);
    }
  });
});
