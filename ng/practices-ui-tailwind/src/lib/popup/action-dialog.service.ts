import { DialogConfig } from '@angular/cdk/dialog';
import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Command, command, CommandOptions, isCommand } from '@nexplore/practices-ng-commands';
import { tryTriggerCommand } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, debounceTime, firstValueFrom, map, merge, Observable, of, Subscription, takeUntil } from 'rxjs';
import { ActionDialogComponent } from './action-dialog.component';
import {
    PuiActionDialogConfig,
    PuiActionDialogConfigUntyped,
    PUIBE_DIALOG_ACTIONS,
    PuiDialogActionsTemplates,
    PuiDialogActionTemplate,
} from './action-dialog.types';
import { PuiModalService } from './modal.service';

type PUIBE_DEFAULT_DIALOG_ACTION = (typeof PUIBE_DIALOG_ACTIONS)[keyof typeof PUIBE_DIALOG_ACTIONS];

type ValueOrGetter<T, TArgs> = T | ((args: TArgs) => T);

@Injectable()
export class PuiActionDialogService {
    private readonly _modalService = inject(PuiModalService);
    private readonly _translate = inject(TranslateService);

    /**
     * Creates a command, that when executed, shows an dialog with a configurable message and a choice of actions,
     * which may be simple YES/NO choices, or actions with asynchronous commands.
     *
     * There is already a set of presets defined in the `PUIBE_DIALOG_PRESETS` constant.
     * Usage example:
     *
     * ```ts
     * deleteCommand = this.actionDialogService.createShowCommand(
     *     PUIBE_DIALOG_PRESETS.confirmDelete(() => this.someApiProxy.deleteSomething(id))
     * );
     * ```
     *
     * This method is a shorthand for using `command.action`, for example:
     * ```ts
     * deleteCommand = command.action(() => this.actionDialogService.showAsync(
     *    PUIBE_DIALOG_PRESETS.confirmDelete(() => this.someApiProxy.deleteSomething(id))
     * ), {silent: true});
     * ```
     * Notice the `silent` option, which is prevents the loading spinner to overlay the dialog. The action-dialog itself already handles loading and error states!
     */
    createShowCommand<TArgs = void>(
        actionConfig: ValueOrGetter<PuiActionDialogConfigUntyped, TArgs>,
        commandConfig?: CommandOptions<TArgs>,
        dialogConfig?: ValueOrGetter<DialogConfig<TArgs, PUIBE_DEFAULT_DIALOG_ACTION>, TArgs>,
    ): Command<TArgs, PUIBE_DEFAULT_DIALOG_ACTION>;
    createShowCommand<
        TArgs,
        TResult,
        TActionTemplates extends PuiDialogActionsTemplates<TResult, TArgs> = typeof PUIBE_DIALOG_ACTIONS,
        TAction extends PuiDialogActionTemplate<TResult, TArgs> = TActionTemplates[keyof TActionTemplates],
    >(
        actionConfig: ValueOrGetter<PuiActionDialogConfig<TAction, TResult, TActionTemplates, TArgs>, TArgs>,
        commandConfig?: CommandOptions<TArgs>,
        dialogConfig?: ValueOrGetter<DialogConfig<TArgs, TResult>, TArgs>,
    ): Command<TArgs, TResult>;
    createShowCommand<
        TArgs,
        TResult,
        TActionTemplates extends PuiDialogActionsTemplates<TResult, TArgs> = typeof PUIBE_DIALOG_ACTIONS,
        TAction extends PuiDialogActionTemplate<TResult, TArgs> = TActionTemplates[keyof TActionTemplates],
    >(
        actionConfig: ValueOrGetter<PuiActionDialogConfig<TAction, TResult, TActionTemplates, TArgs>, TArgs>,
        commandConfig?: CommandOptions<TArgs>,
        dialogConfig?: ValueOrGetter<DialogConfig<TArgs, TResult>, TArgs>,
    ): Command<TArgs, TResult> {
        const getActionConfig = typeof actionConfig === 'function' ? actionConfig : () => actionConfig;
        const getDialogConfig = typeof dialogConfig === 'function' ? dialogConfig : () => dialogConfig;
        const injector = inject(Injector);
        return command.action<TArgs, TResult>(
            (args) =>
                runInInjectionContext(injector, () =>
                    this.showAsync<TResult, TActionTemplates, TAction, TArgs>(getActionConfig(args), {
                        data: args,
                        ...getDialogConfig(args),
                    }),
                ),
            { status: { silent: true }, ...commandConfig },
        );
    }

    /** Shows an dialog with a configurable message and a choice of actions,
     * which may be simple YES/NO choices, or actions with asynchronous commands.
     *
     * There is already a set of presets defined in the `PUIBE_DIALOG_PRESETS` constant.
     * Usage example:
     *
     * ```ts
     * onDelete = async (): Promise<void> => {
     *   const result = await this.actionDialogService.showAsync(
     *     PUIBE_DIALOG_PRESETS.confirmDelete(() => this.someApiProxy.deleteSomething(id))
     *   );
     *
     *   if (result) {
     *     // Do something with result...
     *     this.statusService.showSuccessMessage(`The item ${result.name} was deleted!`);
     *
     *     this.navigateBackToList()
     *   }
     * }
     * ```
     */
    showAsync<TDialogData = unknown>(
        actionConfig: PuiActionDialogConfig<
            PUIBE_DEFAULT_DIALOG_ACTION,
            PUIBE_DEFAULT_DIALOG_ACTION,
            typeof PUIBE_DIALOG_ACTIONS,
            TDialogData,
            PUIBE_DEFAULT_DIALOG_ACTION[]
        >,
        dialogConfig?: DialogConfig<TDialogData, PUIBE_DEFAULT_DIALOG_ACTION>,
    ): Promise<PUIBE_DEFAULT_DIALOG_ACTION>;
    showAsync<
        TResult,
        TActionTemplates extends PuiDialogActionsTemplates<TResult, TDialogData> = typeof PUIBE_DIALOG_ACTIONS,
        TAction extends PuiDialogActionTemplate<TResult, TDialogData> = TActionTemplates[keyof TActionTemplates],
        TDialogData = unknown,
    >(
        actionConfig: PuiActionDialogConfig<TAction, TResult, TActionTemplates, TDialogData>,
        dialogConfig?: DialogConfig<TDialogData, TResult>,
    ): Promise<TResult>;

    async showAsync<
        TResult,
        TActionTemplates extends PuiDialogActionsTemplates<TResult, TDialogData> = typeof PUIBE_DIALOG_ACTIONS,
        TAction extends PuiDialogActionTemplate<TResult, TDialogData> = TActionTemplates[keyof TActionTemplates],
        TDialogData = unknown,
    >(
        actionConfig: PuiActionDialogConfig<TAction, TResult, TActionTemplates, TDialogData>,
        dialogConfig?: DialogConfig<TDialogData, TResult>,
    ): Promise<TResult> {
        const dialogRef = this._modalService.open<TResult, ActionDialogComponent<TAction, TDialogData>, TDialogData>(
            ActionDialogComponent,
            dialogConfig,
        );
        type CommandLike = {
            trigger?: (payload?: unknown) => void;
            cancel?: () => void;
            busy?: boolean;
            busy$?: Observable<boolean>;
            result$?: Observable<TResult>;
            error$?: Observable<unknown>;
            options?: { status?: { blocking?: boolean } };
        };

        if (dialogRef.componentInstance) {
            if (actionConfig.command) {
                (dialogRef.componentInstance as unknown as { command: CommandLike }).command =
                    actionConfig.command as unknown as CommandLike;
            } else {
                (dialogRef.componentInstance as unknown as { command: (action: TAction) => TAction }).command = (
                    action: TAction,
                ) => action;
            }
        }

        if (actionConfig.hideCloseButton !== undefined && dialogRef.componentInstance) {
            dialogRef.componentInstance.hideCloseButton = actionConfig.hideCloseButton;
        }

        if (dialogRef.componentInstance) {
            if (actionConfig.actions instanceof Array) {
                dialogRef.componentInstance.setActions(actionConfig.actions);
            } else if (typeof actionConfig.actions === 'object') {
                const templateMap = (actionConfig.actionTemplates ?? PUIBE_DIALOG_ACTIONS) as unknown as Record<
                    string,
                    Partial<TAction> | undefined
                >;
                const built = Object.entries(actionConfig.actions).map(([key, action]) => {
                    const base = templateMap[key] || {};
                    return {
                        ...base,
                        command: typeof action === 'function' || isCommand(action) ? action : () => action,
                    } as unknown as TAction;
                });
                dialogRef.componentInstance.setActions(built as TAction[]);
            }
        }

        if (dialogRef.componentInstance) {
            if (actionConfig.title) {
                dialogRef.componentInstance.title = actionConfig.title;
            } else if (actionConfig.titleKey) {
                dialogRef.componentInstance.title = this._translate.instant(actionConfig.titleKey);
            }
        }

        if (dialogRef.componentInstance) {
            if (actionConfig.subtitle) {
                dialogRef.componentInstance.subtitle = actionConfig.subtitle;
            } else if (actionConfig.subtitleKey) {
                dialogRef.componentInstance.subtitle = this._translate.instant(actionConfig.subtitleKey);
            }
        }

        if (dialogRef.componentInstance) {
            if (actionConfig.content) {
                dialogRef.componentInstance.content = actionConfig.content;
            } else if (actionConfig.contentKey) {
                dialogRef.componentInstance.content = this._translate.instant(actionConfig.contentKey);
            }
        }

        if (actionConfig.contentInputs && dialogRef.componentInstance) {
            dialogRef.componentInstance.contentInputs = actionConfig.contentInputs;
        }

        const allCommands: CommandLike[] = dialogRef.componentInstance
            ? (
                  [
                      dialogRef.componentInstance.command,
                      ...(dialogRef.componentInstance.actions ?? []).map((a) => a.command),
                  ].filter(Boolean) as CommandLike[]
              ).filter((cmd) => isCommand(cmd))
            : [];

        const closeAction = dialogRef.componentInstance?.actions?.find((a) => a?.representsDialogClose);
        if (closeAction) {
            const closedSub = dialogRef.closed.subscribe(() => {
                // Cancel all running commands
                allCommands.forEach((cmd) => {
                    if (closeAction.command && cmd !== (closeAction.command as CommandLike) && cmd.busy) {
                        cmd.cancel?.();
                    }
                });

                // Trigger the cancel command
                if (closeAction.command) {
                    tryTriggerCommand(closeAction.command);
                } else {
                    dialogRef.componentInstance?.command?.trigger(closeAction);
                }
            });
            // Store subscription to avoid lint warning (could be managed for cleanup if needed)
            (dialogRef as unknown as { _closedSub?: Subscription })._closedSub = closedSub;
        } else {
            dialogRef.disableClose = true;
        }

        const busySub = combineLatest(
            allCommands.map((cmd) => (cmd?.options?.status?.blocking ? of(false) : (cmd.busy$ ?? of(false)))),
        )
            .pipe(
                map((values) => values.some((v) => v === true)),
                debounceTime(1),
                takeUntil(dialogRef.closed),
            )
            .subscribe((busy) => {
                if (dialogRef.componentInstance) {
                    dialogRef.componentInstance.busy = busy;
                }
            });
        (dialogRef as unknown as { _busySub?: Subscription })._busySub = busySub;

        const errors$ = actionConfig.errorClosesDialog
            ? allCommands.map(
                  (cmd) =>
                      (cmd.error$?.pipe(
                          map((err: unknown) => {
                              throw err;
                          }),
                      ) as Observable<never>) ?? of(),
              )
            : [];

        const result = await firstValueFrom(
            merge(
                ...allCommands.map((cmd) => (cmd.result$ as Observable<TResult>) ?? of(undefined as TResult)),
                ...errors$,
            ) as Observable<TResult>,
        );

        dialogRef.close(result);

        return result;
    }
}

