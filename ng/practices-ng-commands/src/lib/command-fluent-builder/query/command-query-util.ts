import { effect, inject, Injector, signal, untracked } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { enhance } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import { CommandAsyncHandlerArg, QueryCommand, QueryOptions } from '../../commands/command.types';
import { createCommandWithSignalsAndStatus } from '../../commands/create-command-with-signals-and-status-util';

export function createQueryCommand<TArg, TResult>(
    handler: CommandAsyncHandlerArg<TArg, TResult>,
    options?: QueryOptions<TArg>,
    defaultOptions?: QueryOptions<TArg>
): QueryCommand<TArg, TResult> {
    const command = createCommandWithSignalsAndStatus(handler, options, defaultOptions);
    const injector = inject(Injector);

    const queryCommand = enhance(command, {
        withMutableResult: {
            get: () => () => {
                const innerSignal = command.resultSignal;
                const writableSignal = signal<TResult | undefined>(undefined);

                effect(
                    () => {
                        const result = innerSignal();
                        if (result !== undefined) {
                            trace('queryCommand', 'withMutableResult', 'innerSignal', result);
                            untracked(() => {
                                writableSignal.set(result);
                            });
                        }
                    },
                    {
                        injector,
                    }
                );

                const result$ = toObservable(writableSignal, { injector });

                return enhance(command, {
                    resultSignal: { get: () => writableSignal },
                    result$: { get: () => result$ },
                    result: { get: () => untracked(() => writableSignal()) },
                });
            },
        },
    });

    return queryCommand as QueryCommand<TArg, TResult>;
}
