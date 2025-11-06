import { Observable } from 'rxjs';

export type SuccessMessage = string | (<T>(result: T) => string);

export type ErrorMessage = string | (<T>(error: T) => string);

/**
 * Generic category to specify the intent of an operation.
 *
 * Used to guide the visual representation of the status progress.
 */
export type StatusCategory = 'none' | 'action' | 'query' | 'query-list' | 'action-save' | 'action-delete';

export interface StatusProgressOptions {
    /** If `true`, the running operation should block the user from interacting */
    blocking?: boolean;

    /** Allows to inform the user with a custom message regarding the progress */
    progressMessage?: string | Observable<string>;

    /** Set a success message for when the status reports success */
    successMessage?: SuccessMessage;

    /** Set a custom error message for when the status reports an error */
    errorMessage?: ErrorMessage;

    /** If `true`, the progress will not be shown (eg. no busy spinner), unless an error occurs. */
    silent?: boolean;

    /**
     * Generic category to specify the intent of an operation.
     *
     * Used to guide the visual representation of the status progress.
     */
    statusCategory?: StatusCategory;

    /** Used to override the default behaviour of non auto-hiding errors and auto-hiding success messages */
    autohide?: boolean;
}
