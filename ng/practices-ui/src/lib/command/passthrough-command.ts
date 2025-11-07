import { combineLatest, defer, EMPTY, map, shareReplay, startWith } from 'rxjs';
import { LegacyCommandBase } from './command-base';
import { LegacyCommandOptions, LegacyCommandTriggerOptions } from './command.types';

/** Links the command with another command, adding default options */
export class PassthroughCommand<TArgs = void, TResult = void> extends LegacyCommandBase<TArgs, TResult> {
    readonly result$ = this.baseCommand.result$;
    readonly triggered$ = this.baseCommand.triggered$;
    readonly completed$ = this.baseCommand.completed$;
    readonly busy$ = this.baseCommand.busy$;
    readonly error$ = this.baseCommand.error$;

    readonly canExecute$ = this.defaultOptions?.canExecute$
        ? combineLatest([this.baseCommand.canExecute$, defer(() => this.defaultOptions?.canExecute$ ?? EMPTY)]).pipe(
              map(([a, b]) => (a === undefined || a === true) && (b === undefined || b === true)),
              startWith(true),
              shareReplay({ bufferSize: 1, refCount: true })
          )
        : this.baseCommand.canExecute$;

    cancel = this.baseCommand.cancel;

    get busy() {
        return this.baseCommand.busy;
    }

    get canExecute() {
        return this.baseCommand.canExecute;
    }

    readonly options: LegacyCommandOptions<TArgs>;

    constructor(
        private baseCommand: LegacyCommandBase<TArgs, TResult>,
        private defaultOptions: LegacyCommandOptions<TArgs>
    ) {
        super();

        this.options = {
            ...defaultOptions,
            ...baseCommand.options,
            beforeExecuteHandler:
                baseCommand.options?.beforeExecuteHandler && defaultOptions?.beforeExecuteHandler
                    ? (args) => {
                          const canExecute = baseCommand.options?.beforeExecuteHandler?.(args);
                          if (canExecute === false) {
                              return false;
                          }

                          return defaultOptions?.beforeExecuteHandler?.(args);
                      }
                    : baseCommand.options?.beforeExecuteHandler ?? defaultOptions?.beforeExecuteHandler,

            afterExecuteHandler:
                baseCommand.options?.afterExecuteHandler && defaultOptions?.afterExecuteHandler
                    ? (args) => {
                          defaultOptions.afterExecuteHandler?.(args);
                          baseCommand.options?.afterExecuteHandler?.(args);
                      }
                    : baseCommand.options?.afterExecuteHandler ?? defaultOptions?.afterExecuteHandler,
        };
    }

    trigger: (args?: TArgs, overrideOptions?: LegacyCommandTriggerOptions<TArgs>) => boolean = (
        args,
        overrideOptions
    ) => {
        if (this.canExecute) {
            return this.baseCommand.trigger(args, overrideOptions ?? this.options);
        }
        return false;
    };
}
