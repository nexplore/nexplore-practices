import { Directive, forwardRef, inject, Input } from '@angular/core';
import { CommandOptions, PuiClickCommandDirective } from '@nexplore/practices-ng-commands';
import { StatusProgressOptions } from '@nexplore/practices-ng-status';
import {
    CombinedCommandInput,
    DestroyService,
    LegacyCommandBase,
    LegacyCommandOptionsWithDeprecations,
} from '@nexplore/practices-ui';
import { PuiLegacyClickCommandDirective } from './legacy-click-command.directive';

type StatusProgressOptionsKeys = Array<keyof StatusProgressOptions>;

type ExtractArgs<TCommandInput> = TCommandInput extends CombinedCommandInput<infer TArgs, any> ? TArgs : never;

type CombinedCommandOptions<TCommandInput> =
    | CommandOptions<ExtractArgs<TCommandInput>>
    | LegacyCommandOptionsWithDeprecations<ExtractArgs<TCommandInput>>;

// type CombinedCommandOptions<TCommandInput> = TCommandInput extends ILegacyCommand
//     ? LegacyCommandOptions<ExtractArgs<TCommandInput>>
//     : TCommandInput extends CommandInput<ExtractArgs<TCommandInput>>
//     ? CommandOptions<ExtractArgs<TCommandInput>>
//     : LegacyCommandOptionsWithDeprecations<ExtractArgs<TCommandInput>>;

/**
 * @internal Used only while migrating to the new command system
 *
 * TODO: Remove once all usages are migrated to the new command system
 */
@Directive({
    selector: '[puiMigratingClickCommandHostDirective]',
    standalone: true,
    providers: [DestroyService],
    hostDirectives: [forwardRef(() => PuiLegacyClickCommandDirective), PuiClickCommandDirective],
})
export class PuiMigratingClickCommandHostDirective<
    TArgs,
    TResult,
    TCommandInput extends CombinedCommandInput<TArgs, TResult>,
> {
    private readonly _modernClickCommandDirective = inject(PuiClickCommandDirective);
    private readonly _legacyClickCommandDirective = inject(PuiLegacyClickCommandDirective);

    @Input()
    set clickCommand(v: TCommandInput | undefined | null) {
        if (v instanceof LegacyCommandBase) {
            this._legacyClickCommandDirective.command = v;
        } else {
            this._modernClickCommandDirective.commandInputSignal.set(v ?? null);
        }
    }

    @Input()
    set commandArgs(v: NoInfer<TArgs> | undefined | null) {
        this._legacyClickCommandDirective.commandArgs = v;
        this._modernClickCommandDirective.commandArgsSignal.set(v);
    }

    @Input()
    set commandOptions(v: CombinedCommandOptions<NoInfer<TCommandInput>> | undefined | null) {
        this._legacyClickCommandDirective.commandOptions = v;

        const modernOptions = v as CommandOptions<TArgs>;
        if (!modernOptions?.status) {
            const mappedOptionKeys: StatusProgressOptionsKeys = [
                'autohide',
                'statusCategory',
                'silent',
                'errorMessage',
                'successMessage',
                'progressMessage',
                'blocking',
            ];
            mappedOptionKeys.forEach((key) => {
                if (modernOptions?.[key] !== undefined) {
                    modernOptions.status = {
                        ...modernOptions.status,
                        [key]: modernOptions[key],
                    };
                }
            });
        } else {
            this._legacyClickCommandDirective.commandOptions = {
                ...v,
                ...modernOptions.status,
            };
        }

        this._modernClickCommandDirective.commandOptionsSignal.set(modernOptions);
    }
}

