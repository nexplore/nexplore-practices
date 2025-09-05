import { CommandImpl } from './command-impl';
import { Command } from './command.types';

/**
 * Returns whether the provided value is a command.
 */
export function isCommand<TArgs, TResult>(value: any): value is Command<TArgs, TResult> {
    return value instanceof CommandImpl;
}
