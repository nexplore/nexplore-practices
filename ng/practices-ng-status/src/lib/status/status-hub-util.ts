import { inject } from '@angular/core';
import { StatusHubService } from './status-hub.service';

/**
 * Runs the given callback without emitting any status events.
 */
export function runWithoutStatus<TResult>(callback: () => TResult, statusHub?: StatusHubService): TResult {
    statusHub = statusHub ?? inject(StatusHubService);

    statusHub.skipNewEventSubscriptions(true);
    try {
        return callback();
    } finally {
        statusHub.skipNewEventSubscriptions(false);
    }
}
