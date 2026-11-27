import type { LocalizedMessage } from '@nexplore/practices-ng-status';
import { Observable, Subscription } from 'rxjs';

export type { LocalizedMessage, TranslatableMessage } from '@nexplore/practices-ng-status';
export { isLocalizedMessage, isTranslatableMessage } from '@nexplore/practices-ng-status';

export type StatusError = true | string | { [key: string]: any } | undefined | Error;

export type StatusSuccess = boolean | LocalizedMessage | undefined;

export type SuccessMessage = LocalizedMessage | (<T>(result: T) => LocalizedMessage);

export type ErrorMessage = LocalizedMessage | (<T>(error: T) => LocalizedMessage);

export type ProgressMessage = LocalizedMessage;

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
    progressMessage?: ProgressMessage | null;
    statusCategory?: StatusCategory;
};

/**
 * Generic category to specify the intend of an operation.
 *
 * Used to guide the visual representation of a the status progress.
 */
export type StatusCategory = 'none' | 'action' | 'query' | 'query-list' | 'action-save' | 'action-delete';

export interface StatusProgressOptions {
    /** If `true`, the running operation should block the user from interacting */
    blocking?: boolean;

    /** Allows to inform the user with a custom message regarding the progress (plain text or a translation key) */
    progressMessage?: ProgressMessage | Observable<ProgressMessage>;

    /** Set a success message (plain text or a translation key) for when the status reports success */
    successMessage?: SuccessMessage;

    /** Set a custom error message (plain text or a translation key) for when the status reports an error */
    errorMessage?: ErrorMessage;

    /** If `true`, the progress will not be shown (eg. no busy spinner), unless an error occurs. */
    silent?: boolean;

    /**
     * Generic category to specify the intend of an operation.
     *
     * Used to guide the visual representation of a the status progress.
     */
    statusCategory?: StatusCategory;

    /** Used to override the default behaviour of non autohiding errors and autohiding success messages */
    autohide?: boolean;
}

export interface StatusHubConfig {
    maxVisibleEventCount: number;
    messageEventTimeToLiveMs: number;
    eventPropertyComparator?: (a: any, b: any, propertyKey: string) => boolean | undefined;
    disableLogErrorsToConsole?: boolean;
    busyAsSilentByDefault?: boolean;
}

export type StatusEventExt<TError = StatusError> = StatusEvent & {
    dismiss: () => void;
    autohide: boolean;
    blocking?: boolean;
    progressMessage?: ProgressMessage | null;
    statusCategory?: StatusCategory;
    _isAlreadyVisible?: boolean;
    _hasBeenPushedAway?: boolean;
    _subscription?: Subscription;
    error?: TError & { _hasBeenAlreadyPresented?: boolean };
};
