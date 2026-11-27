import type { Command } from '@nexplore/practices-ng-commands';
import { command } from '@nexplore/practices-ng-commands';
import type { CombinedCommandInput } from '@nexplore/practices-ui';
import { LegacyCommandBase, tryTriggerCommandAsync } from '@nexplore/practices-ui';

export function commandFromLegacyCommand(commandInput: CombinedCommandInput<any, any>): Command<any, any> {
    if (commandInput instanceof LegacyCommandBase) {
        return command.fromInput((args: any) => tryTriggerCommandAsync(commandInput, args), {
            ...commandInput,
            status: commandInput as any,
        });
    } else {
        return command.fromInput(commandInput);
    }
}
