export { createActionCommand as action } from './create-action-command';
export { createDeleteCommand as actionDelete } from './create-delete-command';
export { createSaveFormCommand as actionSaveForm } from './create-save-form-command';
export { createBackgroundCommand as background } from './create-background-command';
export { createCommandFromInput as fromInput } from './create-command-from-input';
export { createCommandFromInputSignal as fromInputSignal } from './create-command-from-input-signal';

/**
 * Query commands are commands that produce a result and are usually automatically triggered by some data source.
 *
 * Their trigger behavior is a little different from action commands:
 * - If triggered while already running, the command will be canceled and re-triggered with the new arguments, unless the arguments are the same.
 */
export * as query from './query';
