import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable, of } from 'rxjs';
import { anyToObservable } from './any-to-observable';

describe('anyToObservable', () => {
  it('should convert a signal to an observable', async () => {
    const results: string[] = [];

    await TestBed.runInInjectionContext(async () => {
      // Arrange
      const source = signal(10);

      // Act
      const result = anyToObservable(source);

      // Assert
      results.push('is-observable:' + (result instanceof Observable));

      const value = await firstValueFrom(result);
      results.push('value:' + value);

      // Update the signal and get the new observable value
      source.set(20);
      TestBed.flushEffects();
      const newValue = await firstValueFrom(result);
      results.push('new-value:' + newValue);
    });

    expect(results).toEqual([
      'is-observable:true',
      'value:10',
      'new-value:20'
    ]);
  });

  it('should pass through an observable', async () => {
    // Arrange
    const source = of(10);
    const results: string[] = [];

    // Act
    const result = anyToObservable(source);

    // Assert
    results.push('is-same:' + (result === source));

    const value = await firstValueFrom(result);
    results.push('value:' + value);

    expect(results).toEqual([
      'is-same:true',
      'value:10'
    ]);
  });

  it('should convert a static value to an observable', async () => {
    // Arrange
    const source = 10;
    const results: string[] = [];

    // Act
    const result = anyToObservable(source);

    // Assert
    results.push('is-observable:' + (result instanceof Observable));

    const value = await firstValueFrom(result);
    results.push('value:' + value);

    expect(results).toEqual([
      'is-observable:true',
      'value:10'
    ]);
  });
});
