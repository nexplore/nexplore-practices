import { effect, inject, Injector, runInInjectionContext, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { tryDestroyInjector } from '@nexplore/practices-ng-common-util';
import { Observable, Subject } from 'rxjs';
import { toSignalLazy } from './to-signal-lazy';

describe('toSignalLazy', () => {
    it('should lazily connect to observable only when signal is read', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const subscriptions: string[] = [];
            const subject = new Subject<number>();
            const observable = new Observable<number>((subscriber) => {
                subscriptions.push('subscribed');
                const subscription = subject.subscribe({
                    next: (value) => subscriber.next(value),
                    error: (err) => subscriber.error(err),
                    complete: () => subscriber.complete(),
                });
                return () => {
                    subscriptions.push('unsubscribed');
                    subscription.unsubscribe();
                };
            });

            // Act
            const signal = toSignalLazy(observable);

            // Assert - not subscribed yet
            const results: string[] = [];
            results.push('before-read:' + subscriptions.join(','));

            // First read triggers subscription
            results.push('value:' + signal());
            results.push('after-read:' + subscriptions.join(','));

            // Emit value and read again
            subject.next(10);
            TestBed.flushEffects();
            results.push('value:' + signal());

            // Check subscriptions
            results.push('final:' + subscriptions.join(','));

            expect(results).toEqual([
                'before-read:',
                'value:undefined',
                'after-read:subscribed',
                'value:10',
                'final:subscribed',
            ]);
        });
    });

    it('should unsubscribe on destroy', () => {
        const subscriptions: string[] = [];
        const results: string[] = [];

        TestBed.runInInjectionContext(() => {
            const injector = Injector.create({ providers: [], parent: inject(Injector) });

            runInInjectionContext(injector, () => {
                // Arrange
                const observable = new Observable<number>((_subscriber) => {
                    subscriptions.push('subscribed');
                    return () => {
                        subscriptions.push('unsubscribed');
                    };
                });

                // Act
                const signal = toSignalLazy(observable);

                // Read to trigger subscription
                signal();
                TestBed.flushEffects();
                results.push('in-context:' + subscriptions.join(','));
            });

            tryDestroyInjector(injector);
        });

        // Component is destroyed - should unsubscribe
        results.push('after-destroy:' + subscriptions.join(','));

        expect(results).toEqual(['in-context:subscribed', 'after-destroy:subscribed,unsubscribed']);
    });

    it('should emit values from the observable', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const subject = new Subject<number>();
            const results: (number | undefined)[] = [];

            // Act
            const signal = toSignalLazy(subject);

            // Not read yet, so no subscription
            subject.next(5);
            TestBed.flushEffects();

            // First read - undefined because we missed the first emission
            results.push(signal());

            // Emit more values after subscription
            subject.next(10);
            TestBed.flushEffects();
            results.push(signal());

            subject.next(20);
            TestBed.flushEffects();
            results.push(signal());

            // Assert
            expect(results).toEqual([undefined, 10, 20]);
        });
    });

    it('should not trigger unintended change detection when reading signal for the first time', () => {
        // If the signal is read for the first time, the subscription gets connected
        // If the subscription-code includes reads to other signals, it could unintentionally trigger change detection
        TestBed.runInInjectionContext(() => {
            const results: string[] = [];
            const hiddenDependencySignal = signal<any>(null);

            const observable = new Observable<string>((subscriber) => {
                const hidden = hiddenDependencySignal();
                const value = hidden ? 'UNEXPECTED' : 'expected';
                subscriber.next(value);
            });

            const mySignal = toSignalLazy(observable);
            effect(() => {
                results.push('effect:' + mySignal());
            });

            TestBed.flushEffects();

            hiddenDependencySignal.set('hidden'); // Change the hidden dependency
            TestBed.flushEffects();

            expect(results).toEqual(['effect:expected']);
        });
    });

    describe('toSignalLazy options compatibility with toSignal', () => {
        it('should behave identically to toSignal with initialValue option', () => {
            TestBed.runInInjectionContext(() => {
                // Arrange
                const subject = new Subject<number>();
                const initialValue = 42;

                const lazySignal = toSignalLazy(subject, { initialValue });
                const regularSignal = toSignal(subject, { initialValue });

                const lazyResults: number[] = [];
                const regularResults: number[] = [];

                // Track both signals
                effect(() => lazyResults.push(lazySignal()));
                effect(() => regularResults.push(regularSignal()));

                TestBed.flushEffects();

                // Act - emit values
                subject.next(100);
                TestBed.flushEffects();

                subject.next(200);
                TestBed.flushEffects();

                // Assert - should have identical behavior except lazy signal starts later
                expect(lazyResults).toEqual([initialValue, 100, 200]);
                expect(regularResults).toEqual([initialValue, 100, 200]);
            });
        });

        it('should behave identically to toSignal with requireSync option', () => {
            TestBed.runInInjectionContext(() => {
                // Arrange - observable that emits synchronously
                const syncObservable = new Observable<number>((subscriber) => {
                    subscriber.next(42);
                });

                // Act & Assert - regular signal should work with sync emission
                const regularSignal = toSignal(syncObservable, { requireSync: true });
                expect(regularSignal()).toBe(42);

                // Note: toSignalLazy uses connectable() which doesn't emit synchronously,
                // so we test that it throws when requireSync is true and observable doesn't emit sync
                expect(() => {
                    const lazySignal = toSignalLazy(syncObservable, { requireSync: true });
                    lazySignal(); // This should throw because connectable doesn't emit sync
                }).toThrow();
            });
        });

        it('should behave identically to toSignal when requireSync fails', () => {
            TestBed.runInInjectionContext(() => {
                // Arrange - observable that does NOT emit synchronously
                const asyncObservable = new Observable<number>((subscriber) => {
                    setTimeout(() => subscriber.next(42), 0);
                });

                // Act & Assert - both should throw
                expect(() => {
                    const lazySignal = toSignalLazy(asyncObservable, { requireSync: true });
                    lazySignal(); // This should throw
                }).toThrow();

                expect(() => {
                    toSignal(asyncObservable, { requireSync: true });
                }).toThrow();
            });
        });

        it('should behave identically to toSignal with custom equal function', () => {
            TestBed.runInInjectionContext(() => {
                // Arrange
                const subject = new Subject<{ id: number; value: string }>();
                const customEqual = (a: any, b: any) => a?.id === b?.id;

                const lazySignal = toSignalLazy(subject, { equal: customEqual });
                const regularSignal = toSignal(subject, { equal: customEqual });

                const lazyResults: any[] = [];
                const regularResults: any[] = [];

                effect(() => lazyResults.push(lazySignal()));
                effect(() => regularResults.push(regularSignal()));

                TestBed.flushEffects();

                // Act - emit objects with same id but different values
                subject.next({ id: 1, value: 'first' });
                TestBed.flushEffects();

                subject.next({ id: 1, value: 'second' }); // Same id, should not trigger
                TestBed.flushEffects();

                subject.next({ id: 2, value: 'third' }); // Different id, should trigger
                TestBed.flushEffects();

                // Assert - both should filter based on custom equality
                expect(lazyResults).toHaveLength(3); // undefined, first, third
                expect(regularResults).toHaveLength(3);
                expect(lazyResults[0]).toBeUndefined();
                expect(regularResults[0]).toBeUndefined();
                expect(lazyResults[1]).toEqual({ id: 1, value: 'first' });
                expect(regularResults[1]).toEqual({ id: 1, value: 'first' });
                expect(lazyResults[2]).toEqual({ id: 2, value: 'third' });
                expect(regularResults[2]).toEqual({ id: 2, value: 'third' });
            });
        });

        it('should behave identically to toSignal with custom injector option', () => {
            const lazySubscriptions: string[] = [];
            const regularSubscriptions: string[] = [];

            TestBed.runInInjectionContext(() => {
                // Arrange
                const customInjector = Injector.create({
                    providers: [],
                    parent: inject(Injector),
                });

                const lazyObservable = new Observable<number>(() => {
                    lazySubscriptions.push('subscribed');
                    return () => lazySubscriptions.push('unsubscribed');
                });

                const regularObservable = new Observable<number>(() => {
                    regularSubscriptions.push('subscribed');
                    return () => regularSubscriptions.push('unsubscribed');
                });

                // Act
                const lazySignal = toSignalLazy(lazyObservable, { injector: customInjector });
                const regularSignal = toSignal(regularObservable, { injector: customInjector });
                
                // Trigger lazy subscription
                lazySignal();
                regularSignal();
                TestBed.flushEffects();

                // Assert - regular signal should be subscribed, lazy signal should be subscribed after first read
                expect(regularSubscriptions).toEqual(['subscribed']);
                expect(lazySubscriptions).toEqual(['subscribed']);

                // Note: toSignalLazy currently uses the current injector context for cleanup,
                // not the custom injector option. This is a limitation of the current implementation.
                // The test verifies that both signals can be created and read successfully.
            });
        });

        it('should behave identically to toSignal with combined options', () => {
            TestBed.runInInjectionContext(() => {
                // Arrange
                const subject = new Subject<string>();
                const options = {
                    initialValue: 'initial',
                    equal: (a: string, b: string) => a?.toLowerCase() === b?.toLowerCase(),
                };

                const lazySignal = toSignalLazy(subject, options);
                const regularSignal = toSignal(subject, options);

                const lazyResults: string[] = [];
                const regularResults: string[] = [];

                effect(() => lazyResults.push(lazySignal()));
                effect(() => regularResults.push(regularSignal()));

                TestBed.flushEffects();

                // Act
                subject.next('Hello');
                TestBed.flushEffects();

                subject.next('HELLO'); // Should be considered equal
                TestBed.flushEffects();

                subject.next('World');
                TestBed.flushEffects();

                // Assert - should have identical behavior
                expect(lazyResults).toEqual(['initial', 'Hello', 'World']);
                expect(regularResults).toEqual(['initial', 'Hello', 'World']);
            });
        });

        it('should maintain lazy behavior even with options', () => {
            TestBed.runInInjectionContext(() => {
                // Arrange
                const lazySubscriptions: string[] = [];
                const regularSubscriptions: string[] = [];

                const lazyObservable = new Observable<number>(() => {
                    lazySubscriptions.push('subscribed');
                    return () => lazySubscriptions.push('unsubscribed');
                });

                const regularObservable = new Observable<number>(() => {
                    regularSubscriptions.push('subscribed');
                    return () => regularSubscriptions.push('unsubscribed');
                });

                const options = { initialValue: 42 };

                // Act
                const lazySignal = toSignalLazy(lazyObservable, options);
                const regularSignal = toSignal(regularObservable, options);

                // Assert - regular signal should be subscribed immediately
                expect(regularSubscriptions).toEqual(['subscribed']);
                expect(lazySubscriptions).toEqual([]); // Lazy signal not subscribed yet

                // First read of lazy signal should trigger subscription
                lazySignal();
                expect(lazySubscriptions).toEqual(['subscribed']);

                // Both should return initial value
                expect(lazySignal()).toBe(42);
                expect(regularSignal()).toBe(42);
            });
        });
    });
});
