import { AbstractCommand, CommandTriggerOptions } from '@nexplore/practices-ng-commands';
import { firstValueFromMaybeAsync } from '@nexplore/practices-ng-common-util';

import { Subscription, takeUntil } from 'rxjs';
import { LegacyCommandBase } from './command-base';
import { CombinedCommandInput } from './command-interface.types';
import { LegacyCommandTriggerOptions } from './command.types';

/**
 * Triggers the command and waits for the result asynchronously. Throws an error if the action fails.
 *
 * If the command is a function, it will be called with the provided arguments.
 *
 * @param command The command to trigger.
 * @param args The arguments to pass to the command.
 * @param triggerOptions Optional options to override the default options of the command.
 * @returns A promise with the result of the command.
 */
export async function tryTriggerCommandAsync<TArgs, TResult>(
    command: CombinedCommandInput<TArgs, TResult>,
    args?: TArgs,
    triggerOptions?: CommandTriggerOptions | LegacyCommandTriggerOptions<TArgs>
): Promise<TResult | false | null | undefined> {
    if (command instanceof Function) {
        return await firstValueFromMaybeAsync(command(args!, (triggerOptions as any)?.abortSignal));
    }

    if (command instanceof AbstractCommand) {
        return await command.triggerAsync(args!, triggerOptions as CommandTriggerOptions);
    }

    if (command instanceof LegacyCommandBase) {
        if ('triggerAsync' in command && command.triggerAsync) {
            return await (command as any).triggerAsync(args, triggerOptions);
        }
        return await new Promise((resolve, reject) => {
            const subscription = new Subscription();

            subscription.add(
                command.result$.pipe(takeUntil(command.completed$)).subscribe((result) => {
                    resolve(result);
                })
            );

            subscription.add(
                command.error$.pipe(takeUntil(command.completed$)).subscribe((e) => {
                    reject(e);
                })
            );

            const wasTriggered = command.trigger(args!, triggerOptions as any);

            if (!wasTriggered) {
                subscription.unsubscribe();
                resolve(null);
            }
        });
    } else return null;
}

export function tryTriggerCommand(
    command: CombinedCommandInput,
    args?: any,
    triggerOptions?: CommandTriggerOptions | LegacyCommandTriggerOptions<any>
): any {
    if (command instanceof Function) {
        return command(args, (triggerOptions as CommandTriggerOptions)?.abortSignal ?? new AbortSignal());
    }

    if (command instanceof AbstractCommand) {
        return command.trigger(args, triggerOptions as CommandTriggerOptions);
    }

    if (command instanceof LegacyCommandBase) {
        return command.trigger(args, triggerOptions as LegacyCommandTriggerOptions<any>);
    }
}
