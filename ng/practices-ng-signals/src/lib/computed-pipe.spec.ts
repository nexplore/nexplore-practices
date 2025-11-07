import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { of, Subject } from 'rxjs';
import { delay, filter, map, take, tap } from 'rxjs/operators';
import { computedPipe } from './computed-pipe';

describe('computedPipe', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should work with a signal source and no operators', () => {
        TestBed.runInInjectionContext(() => {
            const source = signal(10);
            const results: (number | undefined)[] = [];
            const result = computedPipe(source);
            // Flush effects before capturing the initial value
            TestBed.tick();
            results.push(result());
            source.set(20);
            TestBed.tick();
            results.push(result());
            expect(results).toEqual([10, 20]);
        });
    });

    it('should work with a function source', () => {
        TestBed.runInInjectionContext(() => {
            const innerSignal = signal(10);
            const source = () => innerSignal();
            const results: number[] = [];
            const result = computedPipe(source);
            // Flush effects before capturing the initial value
            TestBed.tick();
            results.push(result());
            innerSignal.set(20);
            TestBed.tick();
            results.push(result());
            expect(results).toEqual([10, 20]);
        });
    });

    it('should work with an observable source', () => {
        TestBed.runInInjectionContext(() => {
            const source = of(10);
            const result = computedPipe(source);
            expect(result()).toBe(10);
        });
    });

    it('should handle empty array with operators', () => {
        TestBed.runInInjectionContext(() => {
            const source = signal<number[]>([]);
            const results: (number | undefined)[] = [];
            const result = computedPipe(
                source,
                map((arr) => arr.map((x) => x * 2)),
                map((arr) => arr.reduce((sum, val) => sum + val, 0)),
            );
            // Flush effects before capturing the initial value
            TestBed.tick();
            results.push(result());
            source.set([1, 2, 3]);
            TestBed.tick();
            results.push(result());
            expect(results).toEqual([0, 12]);
        });
    });

    it('should handle multiple emissions from observable', () => {
        TestBed.runInInjectionContext(() => {
            const subject = new Subject<number>();
            const results: number[] = [];
            const result = computedPipe(
                subject,
                map((x) => x * 2),
            );
            results.push(result());
            subject.next(5);
            TestBed.tick();
            results.push(result());
            subject.next(10);
            TestBed.tick();
            results.push(result());
            expect(results).toEqual([undefined, 10, 20]);
        });
    });

    it('should handle operators with no emissions', () => {
        TestBed.runInInjectionContext(() => {
            const subject = new Subject<number>();
            const results: number[] = [];
            const result = computedPipe(
                subject,
                filter((x) => x > 10),
            );
            results.push(result());
            subject.next(5); // filtered out
            TestBed.tick();
            results.push(result());
            subject.next(15); // passes filter
            TestBed.tick();
            results.push(result());
            expect(results).toEqual([undefined, undefined, 15]);
        });
    });

    it('should handle nested computed signals', () => {
        TestBed.runInInjectionContext(() => {
            const source = signal(2);
            const nestedComputed = computed(() => source() * 3);
            const results: (number | undefined)[] = [];
            const result = computedPipe(
                nestedComputed,
                map((x) => x + 1),
            );
            // Flush effects before capturing the initial value
            TestBed.tick();
            results.push(result());
            source.set(4);
            TestBed.tick();
            results.push(result());
            expect(results).toEqual([7, 13]); // [(2*3)+1, (4*3)+1]
        });
    });

    it('should handle async operators with multiple delays', () => {
        TestBed.runInInjectionContext(() => {
            const source = signal(10);
            const results: (number | undefined)[] = [];
            const result = computedPipe(
                source,
                delay(500),
                map((x) => x * 2),
            );
            results.push(result());
            jest.advanceTimersByTime(500);
            TestBed.tick();
            results.push(result());
            source.set(20);
            jest.advanceTimersByTime(500);
            TestBed.tick();
            results.push(result());
            expect(results).toEqual([undefined, 20, 40]);
        });
    });

    it('should apply single operator to signal', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const source = signal(5);
            const results: number[] = [];

            // Act
            const result = computedPipe(
                source,
                map((x) => x * 2),
            );

            // Flush effects before capturing the initial value
            TestBed.tick();
            results.push(result());

            source.set(10);
            TestBed.tick();
            results.push(result());

            // Assert
            expect(results).toEqual([10, 20]);
        });
    });

    it('should apply two operators to signal', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const source = signal(5);
            const results: number[] = [];

            // Act
            const result = computedPipe(
                source,
                map((x) => x * 2),
                map((x) => x + 5),
            );

            // Flush effects before capturing the initial value
            TestBed.tick();
            results.push(result());

            source.set(10);
            TestBed.tick();

            results.push(result());

            // Assert
            expect(results).toEqual([15, 25]);
        });
    });

    it('should apply three operators to signal', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const source = signal([1, 2, 3, 4, 5]);
            const results: number[] = [];

            // Act
            const result = computedPipe(
                source,
                map((arr) => arr.filter((x) => x > 2)),
                map((arr) => arr.map((x) => x * 2)),
                map((arr) => arr.reduce((sum, val) => sum + val, 0)),
            );

            // Flush effects before capturing the initial value
            TestBed.tick();
            results.push(result());

            source.set([1, 2, 3]);
            TestBed.tick();

            results.push(result());

            // Assert
            expect(results).toEqual([24, 6]); // [3,4,5] => [6,8,10] => 24, [3] => [6] => 6
        });
    });

    it('should apply filter operator correctly', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const subject = new Subject<number>();
            const results: (number | undefined)[] = [];

            // Act
            const result = computedPipe(
                subject,
                filter((x) => x % 2 === 0),
            );

            // Initial value should be undefined
            results.push(result());

            // Emit values
            subject.next(1); // filtered out
            subject.next(2); // passes filter
            TestBed.tick();
            results.push(result());

            subject.next(3); // filtered out
            subject.next(4); // passes filter
            TestBed.tick();
            results.push(result());

            // Assert
            expect(results).toEqual([undefined, 2, 4]);
        });
    });

    it('should handle async operators with delay', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const source = signal(10);
            const results: (number | undefined)[] = [];

            // Act
            const result = computedPipe(source, delay(1000));

            // Initial value should be undefined
            results.push(result());

            // Fast-forward time
            jest.advanceTimersByTime(1000);
            TestBed.tick();
            results.push(result());

            // Change source and check again
            source.set(20);
            TestBed.tick();
            results.push(result());

            // Fast-forward time
            jest.advanceTimersByTime(1000);
            TestBed.tick();
            results.push(result());

            // Assert
            expect(results).toEqual([undefined, 10, 10, 20]);
        });
    });

    it('should work with computed signal as input', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const source = signal(5);
            const computedSource = computed(() => source() * 2);
            const results: number[] = [];

            // Act
            const result = computedPipe(
                computedSource,
                map((x) => x + 3),
            );

            // Flush effects before capturing the initial value
            TestBed.tick();
            results.push(result());

            source.set(10);
            TestBed.tick();

            results.push(result());

            // Assert
            expect(results).toEqual([13, 23]); // [(5*2)+3, (10*2)+3]
        });
    });

    it('should complete properly with take operator', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const subject = new Subject<number>();
            const results: (number | undefined)[] = [];
            const capturedValues: number[] = [];

            // Act
            const result = computedPipe(
                subject,
                take(2),
                tap((x) => capturedValues.push(x)),
            );

            // Initial value should be undefined
            results.push(result());

            // Emit values
            subject.next(1);
            TestBed.tick();
            results.push(result());

            subject.next(2);
            TestBed.tick();
            results.push(result());

            subject.next(3); // Should be ignored due to take(2)
            TestBed.tick();
            results.push(result());

            // Assert
            expect(results).toEqual([undefined, 1, 2, 2]);
            expect(capturedValues).toEqual([1, 2]);
        });
    });
});

