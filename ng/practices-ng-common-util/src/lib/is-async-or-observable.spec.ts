import { describe, expect, it, jest } from '@jest/globals';
import { isAsyncOrObservable } from './is-async-or-observable';
import { of } from 'rxjs';

describe('isAsyncOrObservable', () => {
  it('should return true for Promises', () => {
    const promise = Promise.resolve('test');
    expect(isAsyncOrObservable(promise)).toBe(true);
  });

  it('should return true for Observables', () => {
    const observable = of('test');
    expect(isAsyncOrObservable(observable)).toBe(true);
  });

  it('should return false for primitive values', () => {
    expect(isAsyncOrObservable('test')).toBe(false);
    expect(isAsyncOrObservable(123)).toBe(false);
    expect(isAsyncOrObservable(true)).toBe(false);
    expect(isAsyncOrObservable(null)).toBe(false);
    expect(isAsyncOrObservable(undefined)).toBe(false);
  });

  it('should return false for objects that are not Promises or Observables', () => {
    expect(isAsyncOrObservable({})).toBe(false);
    expect(isAsyncOrObservable([])).toBe(false);
    expect(isAsyncOrObservable(new Date())).toBe(false);
  });
});
