import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subscriber, Subscription } from 'rxjs';
import { delay, finalize, first, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { LegacyCommand } from '../command/command';
import { LegacyCommandBase } from '../command/command-base';

import { IFilterableListViewSource, IListViewSource } from '../list';
import { ErrorMessage, StatusEvent, StatusProgressOptions, SuccessMessage } from './model';
import { StatusHubService } from './status-hub.service';

type CommandWithStatusSubscription<TArgs, TResult> = LegacyCommandBase<TArgs, TResult> & {
    /** Holds the currently active subscription to the status service
     *
     * This will automaticly unsubscribe when the command is completed and resubscribe when the command is triggered again
     *
     * This should not be used directly, but is exposed for testing purposes
     */
    _currentlyActiveStatusSubscription?: Subscription;
};

@Injectable({
    providedIn: 'root',
})
export class StatusService {
    // eslint-disable-next-line @angular-eslint/prefer-inject
    public constructor(private statusHub: StatusHubService = inject(StatusHubService)) {}

    /** Immediately presents a success message to the user */
    showSuccessMessage = (message: string) => {
        this.statusHub.register(of({ success: message, busy: false }));
    };

    registerQuery = <T>(sourceObservable: Observable<T>, progressOptions?: StatusProgressOptions) => {
        const operation = new BehaviorSubject<StatusEvent>({ busy: false });
        this.statusHub.register(
            operation.pipe(map((s) => Object.assign({}, s, { success: undefined }))),
            {
                statusCategory: 'query',
                ...progressOptions,
            },
            sourceObservable,
        );
        return this._registerObservable(sourceObservable, new Subscriber(operation));
    };

    registerAction = <T>(
        sourceObservable: Observable<T>,
        successMessage?: SuccessMessage,
        errorMessage?: ErrorMessage,
        progressOptions?: StatusProgressOptions,
    ): Observable<T> => {
        const operation = new BehaviorSubject<StatusEvent>({ busy: false });
        if (!progressOptions) {
            progressOptions = {};
        }

        if (errorMessage) {
            progressOptions.errorMessage = errorMessage;
        }

        if (successMessage) {
            progressOptions.successMessage = successMessage;
        }

        if (!progressOptions.statusCategory) {
            progressOptions.statusCategory = 'action';
        }

        this.statusHub.register(operation, progressOptions, sourceObservable);
        return this._registerObservable(sourceObservable, new Subscriber(operation));
    };

    registerListViewSource$ = <TSource extends IListViewSource<TData>, TData>(
        listViewSource: TSource,
        progressOptions?: StatusProgressOptions,
    ) => {
        return new Observable<TSource>((subscriber) => {
            subscriber.next(listViewSource);

            return this.subscribeToListViewSource(listViewSource, progressOptions);
        });
    };

    registerListViewSource = <TSource extends IListViewSource<TData>, TData>(
        listViewSource: TSource,
        progressOptions?: StatusProgressOptions,
    ) => {
        return this._registerListViewSourceInternal(listViewSource as any, progressOptions) as TSource;
    };

    registerFilterableListViewSource = <TSource extends IFilterableListViewSource<TData, TFilter>, TData, TFilter>(
        listViewSource: TSource,
        progressOptions?: StatusProgressOptions,
    ) => {
        return this._registerListViewSourceInternal(listViewSource as any, progressOptions) as TSource;
    };

    subscribeToListViewSource = <TSource extends IListViewSource<TData>, TData>(
        listViewSource: TSource,
        progressOptions?: StatusProgressOptions,
    ) => {
        const operation = new BehaviorSubject<StatusEvent>({ busy: false });
        const statusObservable = combineLatest([listViewSource.error$, listViewSource.busy$]).pipe(
            map(([err, busy]) => ({ busy, error: err, success: undefined })),
        );

        const subscription = this.statusHub.register(
            operation,
            { statusCategory: 'query-list', ...progressOptions },
            listViewSource,
        );
        subscription.add(statusObservable.subscribe(operation));
        return subscription;
    };

    private _registerListViewSourceInternal(
        listViewSource: IListViewSource<{}> | IFilterableListViewSource<{}, {}>,
        progressOptions?: StatusProgressOptions,
    ): (IListViewSource<{}> | IFilterableListViewSource<{}, {}>) & {
        _currentlyActiveStatusSubscription?: Subscription;
    } {
        const subscription = this.subscribeToListViewSource(listViewSource, progressOptions);

        Object.assign(listViewSource, { _currentlyActiveStatusSubscription: subscription });

        return listViewSource;
    }

    /**
     * @deprecated Commands register automatically (from `@nexplore/practices-ng-commands`)
     *
     * Wraps the command with a `PassthroughCommand`, that, when executed, notifies the status service of the command execution and its progress.
     *
     * WARNING: The original command will not notify the status service, only the newly returned command will.
     *
     * @param command The command to register
     * @returns A new command that is wrapped with status notifications
     */
    registerCommand<TArgs, TResult>(
        command: LegacyCommandBase<TArgs, TResult>,
    ): CommandWithStatusSubscription<TArgs, TResult> {
        const commandWithStatus = LegacyCommand.withDefaultOptions(command, {
            beforeExecuteHandler: () => {
                commandWithStatus._currentlyActiveStatusSubscription =
                    this._registerCommandOneTime(commandWithStatus).subscribe();
            },
            afterExecuteHandler: () => {
                if (commandWithStatus._currentlyActiveStatusSubscription) {
                    commandWithStatus._currentlyActiveStatusSubscription.unsubscribe();
                }
            },
        }) as CommandWithStatusSubscription<TArgs, TResult>;

        return commandWithStatus;
    }

    /**
     * @deprecated Commands register automatically (from `@nexplore/practices-ng-commands`)
     * Subscribes to the command and registers it with the status service
     *
     * @param command The command to subscribe to
     * @returns A subscription to the status service
     */
    subscribeToCommand<TArgs, TResult>(command: LegacyCommandBase<TArgs, TResult>): Subscription {
        return command.triggered$
            .pipe(
                switchMap(() => {
                    return this._registerCommandOneTime<TArgs, TResult>(command);
                }),
            )
            .subscribe();
    }

    private _registerCommandOneTime<TArgs, TResult>(command: LegacyCommandBase<TArgs, TResult>) {
        const statusObservable = combineLatest([
            command.error$.pipe(startWith(undefined), takeUntil(command.completed$)),
            command.result$.pipe(startWith(undefined), takeUntil(command.completed$)),
            command.completed$.pipe(
                first(),
                map((_) => true),
                startWith(false),
            ),
            command.busy$.pipe(takeUntil(command.completed$)),
        ]).pipe(
            delay(1), // Delay to override any inner status subscriptions
            map(([error, result, hasCompleted, busy]) => ({
                busy,
                error,
                success: hasCompleted && !error ? true : undefined,
                result,
            })),
        ) as Observable<StatusEvent>;

        const options = { ...command.options, statusCategory: command.options?.statusCategory ?? 'action' };
        const innerSubscription = this.statusHub.register(statusObservable, options, command);
        return statusObservable.pipe(finalize(() => innerSubscription.unsubscribe()));
    }

    private _registerObservable<T>(sourceObservable: Observable<T>, statusSubscriber: Subscriber<StatusEvent>) {
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
                    }),
                )
                .subscribe(
                    (next) => {
                        subscriber.next(next);
                        lastResult = next;
                    },
                    (err: unknown) => {
                        statusSubscriber.next({
                            busy: false,
                            error: err as any,
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
                    },
                );
        });
    }
}
