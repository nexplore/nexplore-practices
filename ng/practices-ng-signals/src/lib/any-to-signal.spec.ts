import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from '@jest/globals';
import { of, Subject } from 'rxjs';
import { anyToSignal } from './any-to-signal';

describe('anyToSignal', () => {
  it('should pass through a signal', () => {
    TestBed.runInInjectionContext(() => {
      // Arrange
      const source = signal(10);
      const results: string[] = [];

      // Act
      const result = anyToSignal(source);

      // Assert
      results.push('is-same:' + (result === source));
      results.push('initial:' + result());

      source.set(20);
      TestBed.flushEffects();
      results.push('updated:' + result());

      expect(results).toEqual([
        'is-same:true',
        'initial:10',
        'updated:20'
      ]);
    });
  });

  it('should convert an observable to a signal', () => {
    TestBed.runInInjectionContext(() => {
      // Arrange
      const subject = new Subject<number>();
      const results: string[] = [];

      // Act
      const result = anyToSignal(subject);

      // Assert
      results.push('initial:' + result());

      subject.next(10);
      TestBed.flushEffects();
      results.push('first-update:' + result());

      subject.next(20);
      TestBed.flushEffects();
      results.push('second-update:' + result());

      expect(results).toEqual([
        'initial:undefined',
        'first-update:10',
        'second-update:20'
      ]);
    });
  });

  it('should convert an observable to a signal with default value', () => {
    TestBed.runInInjectionContext(() => {
      // Arrange
      const subject = new Subject<number>();
      const results: string[] = [];

      // Act
      const result = anyToSignal(subject, { defaultValue: 5 });

      // Assert
      results.push('initial:' + result());

      subject.next(10);
      TestBed.flushEffects();
      results.push('first-update:' + result());

      subject.next(20);
      TestBed.flushEffects();
      results.push('second-update:' + result());

      expect(results).toEqual([
        'initial:5',
        'first-update:10',
        'second-update:20'
      ]);
    });
  });

  it('should convert a static value to a signal', () => {
    TestBed.runInInjectionContext(() => {
      // Arrange
      const source = 10;

      // Act
      const result = anyToSignal(source);

      // Assert
      expect(result()).toBe(10);
    });
  });

  it('should handle constant values from observables', () => {
    TestBed.runInInjectionContext(() => {
      // Arrange
      const source = of(42);
      const results: string[] = [];

      // Act
      const result = anyToSignal(source);

      // Capture the value with its immediate result, which is 42 when using of()
      results.push('initial:' + result());

      // Allow time for the observable to emit (though with of() it's immediate)
      TestBed.flushEffects();
      results.push('after-emit:' + result());

      expect(results).toEqual([
        'initial:42',
        'after-emit:42'
      ]);
    });
  });
});
