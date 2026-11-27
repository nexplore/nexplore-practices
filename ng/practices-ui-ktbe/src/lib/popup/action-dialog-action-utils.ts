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

/**
 * The actions a preset created its `actionCommandOptions` for, keyed by that options object. The options of a preset
 * only apply to the action it created: an action the caller replaced (e.g. `actions: { ...preset.actions, DELETE: myCommand }`)
 * is used as before 14.0.0, without the options of the preset.
 */
const presetActionsByCommandOptions = new WeakMap<object, Readonly<Record<string, unknown>>>();

/** Registers the actions a preset created its `actionCommandOptions` for. Returns the options. */
export function registerPresetCommandOptions<T extends object>(commandOptions: T, actions: Record<string, unknown>): T {
    presetActionsByCommandOptions.set(commandOptions, actions);
    return commandOptions;
}

/** The command options of `actionCommandOptions` for the action, unless a preset created them for another action. */
export function getActionCommandOptions<T>(
    actionCommandOptions: Readonly<Record<string, T | undefined>> | undefined,
    key: string,
    action: unknown
): T | undefined {
    if (!actionCommandOptions) {
        return undefined;
    }
    const presetActions = presetActionsByCommandOptions.get(actionCommandOptions);
    if (presetActions && key in presetActions && presetActions[key] !== action) {
        return undefined;
    }
    return actionCommandOptions[key];
}
