import { Subscription } from 'rxjs';
import { StatusCategory } from './types';

export type StatusError = true | string | { [key: string]: any } | undefined | Error;

export type StatusSuccess = boolean | string | undefined;

export interface StatusEvent {
    busy: boolean;
    error?: StatusError;
    success?: StatusSuccess;
    timestamp?: number;
    result?: unknown;
}

export type AggregatedStatusInfo = StatusEvent & {
    dismissError: () => void;
    dismissSuccess: () => void;
    numberOfBusyOperations: number;
    blocking?: boolean;
    progressMessage?: string | null;
    statusCategory?: StatusCategory;
};

export interface StatusHubConfig {
    /**
     * The maximum number of visible events (errors or successes) to display at once.
     */
    maxVisibleEventCount: number;

    /**
     * The time in milliseconds after which a message event (error or success) will be automatically dismissed.
     */
    messageEventTimeToLiveMs: number;

    /**
     * A custom comparator function to determine if two events are considered equal based on a specific property key.
     *
     * Used to filter out duplicates
     *
     * @param a The first event to compare.
     * @param b The second event to compare.
     * @param propertyKey The property key to compare.
     * @returns True if the events are considered equal, false otherwise.
     */
    eventPropertyComparator?: (a: any, b: any, propertyKey: string) => boolean | undefined;

    /**
     * If set to true, errors will not be logged to the console.
     */
    disableLogErrorsToConsole?: boolean;

    /**
     * If set to true, any busy event without an explicit `busy` value will be treated as silent (not shown in the UI) by default.
     */
    busyAsSilentByDefault?: boolean;

    /**
     * Filters the status events based on the provided criteria.
     *
     * Note, the default filter will exclude AbortError exceptions.
     *
     * @param event The status event to evaluate.
     * @returns True if the event passes the filter, false otherwise.
     */
    filter?: (event: StatusEvent) => boolean;
}

export type StatusEventExt<TError = StatusError> = StatusEvent & {
    dismiss: () => void;
    autohide: boolean;
    blocking?: boolean;
    progressMessage?: string | null;
    statusCategory?: StatusCategory;
    _isAlreadyVisible?: boolean;
    _hasBeenPushedAway?: boolean;
    _subscription?: Subscription;
    error?: TError & { _hasBeenAlreadyPresented?: boolean };
};
