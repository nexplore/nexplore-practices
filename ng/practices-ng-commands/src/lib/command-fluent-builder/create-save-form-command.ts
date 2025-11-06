import { inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PuiFormStateService } from '@nexplore/practices-ng-forms';
import { ActionCommand, CommandAsyncHandlerArg, CommandOptions } from '../commands/command.types';
import { createCommandWithSignalsAndStatus } from '../commands/create-command-with-signals-and-status-util';

/**
 * Creates an action command that can be triggered with the args of the provided type.
 *
 * Accepts a form group or a function that returns a form group, which will be used to check the validity of the form before calling the handler.
 *
 * If the form is not valid, the command will not be triggered and a `PuiFormularInvalidError` will be thrown.
 *
 * Automatically registers the status in the `StatusHubService`.
 *
 * @param formGroupOrGetter The form group or a function that returns the form group, accepting the args as the single parameter.
 * @param handler The handler function that will be called when the command is triggered.
 * @param options Options for the command.
 */
export function createSaveFormCommand<TFormGroup extends FormGroup, TArgs = void, TResult = void>(
    formGroupOrGetter: TFormGroup | ((args: NoInfer<TArgs>) => TFormGroup),
    handler: CommandAsyncHandlerArg<TArgs, TResult>,
    options?: CommandOptions<TArgs>
): ActionCommand<TArgs, TResult> {
    const formStateService = inject(PuiFormStateService);
    return createCommandWithSignalsAndStatus(
        (args: TArgs, signal: AbortSignal) => {
            const formGroup = typeof formGroupOrGetter === 'function' ? formGroupOrGetter(args) : formGroupOrGetter;
            const handlerFn = typeof handler === 'function' ? handler : (_: any, __: AbortSignal) => handler;
            return formStateService.runWithFormValidityCheck(formGroup, () => handlerFn(args, signal));
        },
        options,
        {
            concurrentTriggerBehavior: { type: 'ignore' },
            status: {
                statusCategory: 'action-save',
            },
        }
    );
}
