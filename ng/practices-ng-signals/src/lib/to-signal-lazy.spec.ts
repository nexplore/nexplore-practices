import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { toSignalLazy } from './to-signal-lazy';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { tryDestroyInjector } from '@nexplore/practices-ng-common-util';

describe('toSignalLazy', () => {
    it('should lazily connect to observable only when signal is read', () => {
        TestBed.runInInjectionContext(() => {
            // Arrange
            const subscriptions: string[] = [];
            const subject = new Subject<number>();
            const observable = new Observable<number>(subscriber => {
                subscriptions.push('subscribed');
                const subscription = subject.subscribe({
                    next: value => subscriber.next(value),
                    error: err => subscriber.error(err),
                    complete: () => subscriber.complete()
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
                'final:subscribed'
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
                const observable = new Observable<number>(_subscriber => {
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

        expect(results).toEqual([
            'in-context:subscribed',
            'after-destroy:subscribed,unsubscribed'
        ]);
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
});
