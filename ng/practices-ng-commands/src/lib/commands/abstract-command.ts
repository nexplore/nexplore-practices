import { Observable } from 'rxjs';
import { AbstractCommandOptions } from './command-internal.types';
import { CommandAfterExecuteResult, CommandTriggerOptions } from './command.types';

export const ABORTED = undefined;

/**
 * Abstract class representing a command that can be triggered with arguments of type `TArgs` and produces results of type `TResult`.
 *
 * Holds the state of the command and provides observables for the state and results.
 */
export abstract class AbstractCommand<
    TArgs,
    TResult,
    TOptions extends AbstractCommandOptions<TArgs> = AbstractCommandOptions<TArgs>
> {
    /** Observable with the results of the handler function */
    abstract readonly result$: Observable<TResult>;

    /** Observable emitting whenever the handler is triggered*/
    abstract readonly triggered$: Observable<void>;

    /** Observable emitting whenever the handler source observable completes or exits with error */
    abstract readonly completed$: Observable<void>;

    /** Observable of the current and future busy state */
    abstract readonly busy$: Observable<boolean>;

    /** Observable emitting whenever the handler throws an error */
    abstract readonly error$: Observable<Error>;

    /** Triggers the command, returning a promise of the result or false if it was never triggered. */
    abstract triggerAsync: (args: TArgs, triggerOptions?: CommandTriggerOptions) => Promise<TResult | typeof ABORTED>;

    abstract cancel: () => void;

    abstract readonly busy: boolean;
    abstract readonly error: Error | unknown | undefined;
    abstract readonly result: TResult | undefined;

    abstract readonly options: TOptions;

    trigger(): void;
    trigger(args: TArgs, triggerOptions?: CommandTriggerOptions): void;
    trigger(args?: TArgs, triggerOptions?: CommandTriggerOptions): void {
        this.triggerAsync(args!, triggerOptions);
    }

    addOnBeforeExecuteHandler(handler: (args: TArgs) => boolean | void): void {
        const innerHandler = this.options.beforeExecuteHandler;
        this.options.beforeExecuteHandler = innerHandler
            ? (...args: any[]) => {
                  const result = (handler as any)(...args);
                  if (result === false) {
                      return false;
                  }
                  return (innerHandler as any)(...args);
              }
            : handler;
    }

    addOnAfterExecuteHandler(handler: (params: CommandAfterExecuteResult<TArgs>) => void): void {
        const innerHandler = this.options.afterExecuteHandler;
        this.options.afterExecuteHandler = innerHandler
            ? (...args: any[]) => {
                  (handler as any)(...args);
                  (innerHandler as any)(...args);
              }
            : handler;
    }
}
