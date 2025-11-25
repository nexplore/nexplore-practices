import { DialogConfig } from '@angular/cdk/dialog';
import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Command, command, CommandOptions, isCommand } from '@nexplore/practices-ng-commands';
import { tryTriggerCommand } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, debounceTime, firstValueFrom, map, merge, Observable, of, takeUntil } from 'rxjs';
import { ActionDialogComponent } from './action-dialog.component';
import {
    PUIBE_DIALOG_ACTIONS,
    PuibeActionDialogConfig,
    PuibeActionDialogConfigUntyped,
    PuibeDialogActionsTemplates,
    PuibeDialogActionTemplate,
} from './action-dialog.types';
import { PuibeModalService } from './modal.service';

type PUIBE_DEFAULT_DIALOG_ACTION = (typeof PUIBE_DIALOG_ACTIONS)[keyof typeof PUIBE_DIALOG_ACTIONS];

type ValueOrGetter<T, TArgs> = T | ((args: TArgs) => T);

@Injectable()
export class PuibeActionDialogService {
    private readonly _modalService = inject(PuibeModalService);
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
     * ), { status: { silent: true } });
     * ```
     * Notice the `silent` option, which prevents the loading spinner to overlay the dialog. The action-dialog itself already handles loading and error states!
     */
    createShowCommand<TArgs = void>(
        actionConfig: ValueOrGetter<PuibeActionDialogConfigUntyped, TArgs>,
        commandConfig?: CommandOptions<TArgs>,
        dialogConfig?: ValueOrGetter<DialogConfig<TArgs, PUIBE_DEFAULT_DIALOG_ACTION>, TArgs>
    ): Command<TArgs, PUIBE_DEFAULT_DIALOG_ACTION>;
    createShowCommand<
        TArgs,
        TResult,
        TActionTemplates extends PuibeDialogActionsTemplates<TResult, TArgs> = typeof PUIBE_DIALOG_ACTIONS,
        TAction extends PuibeDialogActionTemplate<TResult, TArgs> = TActionTemplates[keyof TActionTemplates]
    >(
        actionConfig: ValueOrGetter<PuibeActionDialogConfig<TAction, TResult, TActionTemplates, TArgs>, TArgs>,
        commandConfig?: CommandOptions<TArgs>,
        dialogConfig?: ValueOrGetter<DialogConfig<TArgs, TResult>, TArgs>
    ): Command<TArgs, TResult>;
    createShowCommand<
        TArgs,
        TResult,
        TActionTemplates extends PuibeDialogActionsTemplates<TResult, TArgs> = typeof PUIBE_DIALOG_ACTIONS,
        TAction extends PuibeDialogActionTemplate<TResult, TArgs> = TActionTemplates[keyof TActionTemplates]
    >(
        actionConfig: ValueOrGetter<PuibeActionDialogConfig<TAction, TResult, TActionTemplates, TArgs>, TArgs>,
        commandConfig?: CommandOptions<TArgs>,
        dialogConfig?: ValueOrGetter<DialogConfig<TArgs, TResult>, TArgs>
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
                    })
                ),
            { status: { silent: true }, ...commandConfig }
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
        actionConfig: PuibeActionDialogConfig<
            PUIBE_DEFAULT_DIALOG_ACTION,
            PUIBE_DEFAULT_DIALOG_ACTION,
            typeof PUIBE_DIALOG_ACTIONS,
            TDialogData,
            PUIBE_DEFAULT_DIALOG_ACTION[]
        >,
        dialogConfig?: DialogConfig<TDialogData, PUIBE_DEFAULT_DIALOG_ACTION>
    ): Promise<PUIBE_DEFAULT_DIALOG_ACTION>;
    showAsync<
        TResult,
        TActionTemplates extends PuibeDialogActionsTemplates<TResult, TDialogData> = typeof PUIBE_DIALOG_ACTIONS,
        TAction extends PuibeDialogActionTemplate<TResult, TDialogData> = TActionTemplates[keyof TActionTemplates],
        TDialogData = unknown
    >(
        actionConfig: PuibeActionDialogConfig<TAction, TResult, TActionTemplates, TDialogData>,
        dialogConfig?: DialogConfig<TDialogData, TResult>
    ): Promise<TResult>;

    async showAsync<
        TResult,
        TActionTemplates extends PuibeDialogActionsTemplates<TResult, TDialogData> = typeof PUIBE_DIALOG_ACTIONS,
        TAction extends PuibeDialogActionTemplate<TResult, TDialogData> = TActionTemplates[keyof TActionTemplates],
        TDialogData = unknown
    >(
        actionConfig: PuibeActionDialogConfig<TAction, TResult, TActionTemplates, TDialogData>,
        dialogConfig?: DialogConfig<TDialogData, TResult>
    ): Promise<TResult> {
        const dialogRef = this._modalService.open<TResult, ActionDialogComponent<TAction, TDialogData>, TDialogData>(
            ActionDialogComponent,
            dialogConfig
        );
        if (actionConfig.command) {
            dialogRef.componentInstance.command = actionConfig.command;
        } else {
            dialogRef.componentInstance.command = ((action: TAction) => action) as any;
        }

        if (actionConfig.hideCloseButton !== undefined) {
            dialogRef.componentInstance.hideCloseButton = actionConfig.hideCloseButton;
        }

        if (actionConfig.actions instanceof Array) {
            dialogRef.componentInstance.setActions(actionConfig.actions);
        } else if (typeof actionConfig.actions === 'object') {
            const templates = actionConfig.actionTemplates ?? PUIBE_DIALOG_ACTIONS;
            dialogRef.componentInstance.setActions(
                Object.entries(actionConfig.actions).map(([key, action]) => ({
                    ...templates[key],
                    command: typeof action === 'function' || isCommand(action) ? action : () => action,
                }))
            );
        }

        if (actionConfig.title) {
            dialogRef.componentInstance.title = actionConfig.title;
        } else if (actionConfig.titleKey) {
            dialogRef.componentInstance.title = this._translate.instant(actionConfig.titleKey);
        }

        if (actionConfig.subtitle) {
            dialogRef.componentInstance.subtitle = actionConfig.subtitle;
        } else if (actionConfig.subtitleKey) {
            dialogRef.componentInstance.subtitle = this._translate.instant(actionConfig.subtitleKey);
        }

        if (actionConfig.content) {
            dialogRef.componentInstance.content = actionConfig.content;
        } else if (actionConfig.contentKey) {
            dialogRef.componentInstance.content = this._translate.instant(actionConfig.contentKey);
        }

        if (actionConfig.contentInputs) {
            dialogRef.componentInstance.contentInputs = actionConfig.contentInputs;
        }

        const allCommands = [
            dialogRef.componentInstance.command,
            ...(dialogRef.componentInstance.actions ?? []).map((a) => a.command),
        ]
            .filter(Boolean)
            .filter((cmd) => isCommand(cmd));

        const closeAction = dialogRef.componentInstance.actions?.find((a) => a?.representsDialogClose);
        if (closeAction) {
            dialogRef.closed.subscribe(() => {
                // Cancel all running commands
                allCommands.forEach((cmd) => {
                    if (cmd !== (closeAction.command as any) && cmd.busy) {
                        cmd.cancel();
                    }
                });

                // Trigger the cancel command
                if (closeAction.command) {
                    tryTriggerCommand(closeAction.command);
                } else {
                    dialogRef.componentInstance.command?.trigger(closeAction);
                }
            });
        } else {
            dialogRef.disableClose = true;
        }

        combineLatest(allCommands.map((cmd) => (cmd?.options?.status?.blocking ? of(false) : cmd.busy$)))
            .pipe(
                map((values) => values.some((v) => v === true)),
                debounceTime(1),
                takeUntil(dialogRef.closed)
            )
            .subscribe((busy) => {
                dialogRef.componentInstance.busy = busy;
            });

        const errors$ = actionConfig.errorClosesDialog
            ? allCommands.map((cmd) =>
                  cmd.error$.pipe(
                      map((err) => {
                          throw err;
                      })
                  )
              )
            : [];

        const result = await firstValueFrom(
            merge(...allCommands.map((cmd) => cmd.result$), ...errors$) as Observable<TResult>
        );

        dialogRef.close(result);

        return result;
    }
}
