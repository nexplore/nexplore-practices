import { Observable } from 'rxjs';
import { LegacyCommandOptions, LegacyCommandTriggerOptions } from './command.types';

/**
 * @deprecated
 *
 * Use `AbstractCommand` instead from `@nexplore/practices-ng-commands`
 */
export abstract class LegacyCommandBase<TArgs, TResult> {
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

    /** Observable of the current and future canExecute state that was provided  */
    abstract readonly canExecute$: Observable<boolean>;

    abstract trigger: (args?: TArgs, overrideOptions?: LegacyCommandTriggerOptions<TArgs>) => boolean;

    abstract cancel: () => void;

    abstract readonly busy: boolean;

    abstract readonly canExecute: boolean;

    abstract readonly options?: LegacyCommandOptions<TArgs>;
}
