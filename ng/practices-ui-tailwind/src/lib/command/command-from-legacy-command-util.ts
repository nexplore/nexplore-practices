import { command, Command } from '@nexplore/practices-ng-commands';
import { CombinedCommandInput, LegacyCommandBase, tryTriggerCommandAsync } from '@nexplore/practices-ui';

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
