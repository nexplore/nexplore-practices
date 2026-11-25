// Internal helpers of the action dialog, kept in their own file so that the package index does not export them.
import { AbstractCommand } from '@nexplore/practices-ng-commands';
import type { CombinedCommandInput } from '@nexplore/practices-ui';
import { LegacyCommandBase } from '@nexplore/practices-ui';

/**
 * Whether the value of an action is something to execute (a function, a command or a legacy command) rather than the
 * plain result of the action (e.g. `CANCEL: false`).
 */
export function isActionCommandInput(value: unknown): value is CombinedCommandInput<any, any> {
    if (typeof value === 'function' || value instanceof AbstractCommand || value instanceof LegacyCommandBase) {
        return true;
    }
    // Like `command.fromInput`, also accept legacy commands that do not extend LegacyCommandBase (e.g. from a second
    // copy of the package)
    return typeof value === 'object' && value !== null && 'trigger' in value && 'error$' in value && 'result$' in value;
}
