import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { finalize, map, share, shareReplay, takeUntil } from 'rxjs/operators';
import { ErrorMessage, StatusProgressOptions, SuccessMessage } from './types';

import { AggregatedStatusInfo, StatusEvent, StatusEventExt, StatusHubConfig } from './model';
import { getLatestStatusEventsList$, StatusMap } from './status-hub.util-internal';

@Injectable({
    providedIn: 'root',
})
export class StatusHubService {
    private _aggregatedStatusMapSubject = new BehaviorSubject<StatusMap>({});
    private _operationCount = 0;
    private _skipNewEventSubscriptions = false;

    public config: StatusHubConfig = {
        maxVisibleEventCount: 3,
        messageEventTimeToLiveMs: 5000,
        busyAsSilentByDefault: false,
        disableLogErrorsToConsole: true,
        filter: (ev) => !(ev.error instanceof DOMException && ev.error.name === 'AbortError'), // Ignore abort errors by default (These are only thrown by AbortController and should never be shown to the user)
    };

    get currentBusyOperations() {
        return Object.values(this._aggregatedStatusMapSubject.value).filter((ev) => ev.busy);
    }

    /**
     * An observable of a list with the latest status events that have either an error or a success message
     **/
    readonly latestStatusEvents$ = getLatestStatusEventsList$(this._aggregatedStatusMapSubject, this.config);

    /**
     * An observable of an aggregated view of the latest status events
     **/
    readonly aggregatedStatus$ = this._aggregatedStatusMapSubject.pipe(
        map((statusMap: StatusMap) => {
            const aggregatedStatus = this.createEmptyAggregatedStatusInfo();
            const now = performance.now();
            const statusToRemove: number[] = [];
            for (let i = this._operationCount; i >= 0; i--) {
                const status = statusMap[i];
                if (!status) {
                    continue;
                } else if (
                    aggregatedStatus.busy &&
                    aggregatedStatus.error &&
                    aggregatedStatus.success &&
                    aggregatedStatus.blocking &&
                    aggregatedStatus.progressMessage
                ) {
                    // We can just break out when all properties are set
                    break;
                }

                aggregatedStatus.numberOfBusyOperations += +status.busy;

                if (!aggregatedStatus.busy) {
                    aggregatedStatus.busy = status.busy;
                }

                if (status.busy && !aggregatedStatus.blocking) {
                    aggregatedStatus.blocking = status.blocking;
                }

                if (status.busy && !aggregatedStatus.progressMessage) {
                    aggregatedStatus.progressMessage = status.progressMessage;
                }

                if (status.busy && !aggregatedStatus.statusCategory) {
                    aggregatedStatus.statusCategory = status.statusCategory;
                }

                const isExpired = status.timestamp && now - status.timestamp > this.config.messageEventTimeToLiveMs;
                if (!status.busy && status.autohide && isExpired) {
                    statusToRemove.push(i);
                    continue;
                }

                if (
                    status._hasBeenPushedAway &&
                    status.timestamp &&
                    status.timestamp > this.config.messageEventTimeToLiveMs
                ) {
                    statusToRemove.push(i);
                    continue;
                }

                if (!aggregatedStatus.error) {
                    aggregatedStatus.error = status.error;
                    aggregatedStatus.dismissError = () => {
                        this.removeStatus(i);
                    };
                }

                if (!aggregatedStatus.success) {
                    aggregatedStatus.success = status.success;
                    aggregatedStatus.dismissSuccess = () => this.removeStatus(i);
                }
            }

            if (statusToRemove.length) {
                this.removeMultipleStatus(statusToRemove);
            }

            return aggregatedStatus;
        }),
        share()
    );

    /** @deprecated
     * Use currentAggregatedStatus$ instead
     */
    readonly status$ = this.aggregatedStatus$;

    /** An observable representing the latest busy state */
    readonly busy$ = this.aggregatedStatus$.pipe(
        map((s) => s.busy),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    /** An observable representing the latest busy state **blocking** the user-interface */
    readonly busyAndBlocking$ = this.aggregatedStatus$.pipe(
        map((s) => s.busy && s.blocking),
        shareReplay({ bufferSize: 1, refCount: true })
    );

    /**
     * Gets a stream of the latest status events with the given config, overriding the default config
     *
     * @param config The config to use for this stream
     * @returns A stream of the latest status events with the given config
     */
    getLatestStatusEventsWithConfig$(config: StatusHubConfig) {
        return getLatestStatusEventsList$(this._aggregatedStatusMapSubject, config);
    }

    /**
     * Registers the operation in the status hub
     *
     * @param operation the observable stream of status updates
     * @param progressOptions Additional options
     * @param initiator An object representing the original operation. An identifier will be attached to the object preventing multiple status messages of the same operation
     */
    register(operation: Observable<StatusEvent>, progressOptions?: StatusProgressOptions, initiator?: any) {
        if (this._skipNewEventSubscriptions) {
            return Subscription.EMPTY;
        }

        const operationId = initiator?._statusHubOperationId ?? this._operationCount++;
        if (initiator) {
            if (initiator._statusHubOperationId !== undefined) {
                // initiator can only be registered once, unless it was completed
                const existingOperation = this._aggregatedStatusMapSubject.value[initiator._statusHubOperationId];
                if (
                    existingOperation &&
                    !existingOperation._hasBeenPushedAway &&
                    !existingOperation.success &&
                    !existingOperation.error &&
                    !existingOperation._subscription?.closed
                ) {
                    return existingOperation._subscription ?? Subscription.EMPTY;
                } else if (existingOperation?.error) {
                    // It has been previously completed with error, let's push it away to make space for the new operation
                    this.updateStatus(initiator._statusHubOperationId, { _hasBeenPushedAway: true });
                }
            }

            initiator._statusHubOperationId = operationId;
        }

        const finalized$ = new Subject<void>();
        operation = operation.pipe(
            finalize(() => {
                finalized$.next();
                this.updateStatus(
                    operationId,
                    (prev) => ({
                        progressMessage: null,
                        blocking: false,
                        busy: false,
                        success: prev?.success
                            ? this.unwrapMessage(progressOptions?.successMessage, prev.result) ?? prev.success
                            : prev?.success,
                    }),
                    progressOptions
                );
            })
        );

        const subscription = operation.subscribe((statusEvent) => {
            const newEvent: Partial<StatusEventExt> = {
                ...statusEvent,
            };
            if (progressOptions?.blocking) {
                newEvent.blocking = progressOptions.blocking;
            }

            if (typeof progressOptions?.progressMessage === 'string') {
                newEvent.progressMessage = progressOptions.progressMessage;
            }

            if (statusEvent.error && !this.config?.disableLogErrorsToConsole) {
                console.error(statusEvent.error);
            }

            if (statusEvent.error && progressOptions?.errorMessage) {
                newEvent.error = this.unwrapMessage(progressOptions.errorMessage, statusEvent.error);
            }

            if (
                statusEvent.busy &&
                (progressOptions?.silent ||
                    (this.config.busyAsSilentByDefault &&
                        !progressOptions?.blocking &&
                        !newEvent.progressMessage &&
                        progressOptions?.silent !== false)) // Skip if explicitly disabled
            ) {
                newEvent.busy = false;
            }

            this.updateStatus(operationId, newEvent, progressOptions);
        });

        if (progressOptions?.progressMessage instanceof Observable) {
            progressOptions.progressMessage
                .pipe(takeUntil(finalized$))
                .subscribe((msg) => this.updateStatus(operationId, { progressMessage: msg }, progressOptions));
        }

        this.registerStatusSubscription(operationId, subscription);
        return subscription;
    }

    /**
     * @internal
     */
    public skipNewEventSubscriptions(skip: boolean): void {
        this._skipNewEventSubscriptions = skip;
    }

    private unwrapMessage(message: SuccessMessage | ErrorMessage | undefined, result: any): string | undefined {
        if (typeof message === 'function') {
            try {
                return message(result);
            } catch (error) {
                console.error(`Error while unwrapping success message`, { error, message, result });
            }
        }

        if (typeof message === 'string') {
            return message;
        }
        return undefined;
    }

    private createEmptyAggregatedStatusInfo(): AggregatedStatusInfo {
        return {
            busy: false,
            error: undefined,
            success: undefined,
            dismissError: () => {},
            dismissSuccess: () => {},
            numberOfBusyOperations: 0,
        };
    }

    private removeStatus(id: number) {
        this.removeMultipleStatus([id]);
    }

    private removeMultipleStatus(ids: number[]) {
        const updatedMap = Object.assign({}, this._aggregatedStatusMapSubject.value);
        ids.forEach((i) => delete updatedMap[i]);
        this._aggregatedStatusMapSubject.next(updatedMap);
    }

    private registerStatusSubscription(operationId: number, subscription: Subscription) {
        const currentValue = this._aggregatedStatusMapSubject.value[operationId];
        // Do not emit any value, just prepare the value
        this._aggregatedStatusMapSubject.value[operationId] = {
            ...currentValue,
            _subscription: subscription,
        };
    }

    private updateStatus(
        operationId: number,
        statusEvent: Partial<StatusEventExt> | ((current: StatusEventExt) => Partial<StatusEventExt>),
        options?: StatusProgressOptions
    ) {
        const prevValue = this._aggregatedStatusMapSubject.value[operationId];

        if (typeof statusEvent === 'function') {
            statusEvent = statusEvent(prevValue);
        }

        // If we have a new status event with an already presented error, ignore it completely
        if (!prevValue && statusEvent.error && statusEvent.error._hasBeenAlreadyPresented) {
            return;
        }

        const newStatusEvent = {
            ...prevValue,
            ...statusEvent,
            autohide: options?.autohide ?? statusEvent.success !== undefined,
            statusCategory: options?.statusCategory,
            timestamp: performance.now(),
            dismiss: this._aggregatedStatusMapSubject.value?.['dismiss'] ?? (() => this.removeStatus(operationId)),
        };

        if (this.config?.filter && !this.config.filter(newStatusEvent)) {
            return;
        }

        this._aggregatedStatusMapSubject.next(
            Object.assign({}, this._aggregatedStatusMapSubject.value, {
                [operationId]: newStatusEvent,
            })
        );

        if (statusEvent.error) {
            statusEvent.error._hasBeenAlreadyPresented = true;
        }
    }
}
