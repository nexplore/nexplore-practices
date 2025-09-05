import { StatusCategory } from './types';
import { Subscription } from 'rxjs';

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
    progressMessage?: string | null;
    statusCategory?: StatusCategory;
    _isAlreadyVisible?: boolean;
    _hasBeenPushedAway?: boolean;
    _subscription?: Subscription;
    error?: TError & { _hasBeenAlreadyPresented?: boolean };
};
