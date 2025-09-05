import { inject } from '@angular/core';
import { StatusProgressOptions } from './types';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { StatusEvent } from './model';
import { StatusHubService } from './status-hub.service';

export function registerObservableStatusSubscription<T>(
    sourceObservable: Observable<T>,
    progressOptions?: StatusProgressOptions,
    statusHub?: StatusHubService
): Observable<T> {
    const operation = new BehaviorSubject<StatusEvent>({ busy: false });
    statusHub = statusHub ?? inject(StatusHubService);
    statusHub.register(
        operation.pipe(map((s) => Object.assign({}, s, { success: undefined }))),
        {
            statusCategory: 'query',
            ...progressOptions,
        },
        sourceObservable
    );
    return wrapObservableWithStatusSubscriber(sourceObservable, new Subscriber(operation));
}

export function wrapObservableWithStatusSubscriber<T>(
    sourceObservable: Observable<T>,
    statusSubscriber: Subscriber<StatusEvent>
) {
    let lastResult: T;

    return new Observable<T>((subscriber) => {
        statusSubscriber.next({ busy: true, error: undefined, success: undefined });
        return sourceObservable
            .pipe(
                finalize(() => {
                    if (!statusSubscriber.closed) {
                        statusSubscriber.next({
                            busy: false,
                            error: undefined,
                            success: true,
                            result: lastResult,
                        });
                        statusSubscriber.complete();
                    }
                })
            )
            .subscribe(
                (next) => {
                    subscriber.next(next);
                    lastResult = next;
                },
                (err: unknown) => {
                    statusSubscriber.next({
                        busy: false,
                        error: err as Error,
                        success: undefined,
                    });
                    statusSubscriber.complete();
                    subscriber.error(err);
                },
                () => {
                    statusSubscriber.next({
                        busy: false,
                        error: undefined,
                        success: true,
                        result: lastResult,
                    });
                    statusSubscriber.complete();
                    subscriber.complete();
                }
            );
    });
}
