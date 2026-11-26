import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
    Component,
    inject,
    Injector,
    Input,
    model,
    runInInjectionContext,
    signal,
    ChangeDetectionStrategy,
} from '@angular/core';
import type { CommandOptions } from '@nexplore/practices-ng-commands';
import { Command, command, isCommand } from '@nexplore/practices-ng-commands';
import { CombinedCommandInput } from '@nexplore/practices-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { PuibeButtonDirective } from '../button/button.directive';
import { PuibeIconSpinnerComponent } from '../icons/icon-spinner.component';
import { PuibeHideIfEmptyTextDirective } from '../util/hide-if-empty-text.directive';
import { DialogAction, DialogContent, PuibeDialogActionTemplate } from './action-dialog.types';
import { DialogTemplateContentComponent } from './dialog-template-content.component';
import { PuibeModalContentDirective } from './modal-content.directive';
import { PuibeModalFooterActionDirective } from './modal-footer-action.directive';
import { PuibeModalSubtitleDirective } from './modal-subtitle.directive';
import { PuibeModalTitleDirective } from './modal-title.directive';
import { PuibeModalComponent } from './modal.component';

@Component({
    selector: 'puibe-action-dialog',
    standalone: true,
    templateUrl: './action-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [
        PuibeModalComponent,
        PuibeModalContentDirective,
        PuibeModalTitleDirective,
        PuibeModalSubtitleDirective,
        PuibeModalFooterActionDirective,
        PuibeButtonDirective,
        TranslatePipe,
        PuibeIconSpinnerComponent,
        DialogTemplateContentComponent,
        PuibeHideIfEmptyTextDirective,
    ],
})
export class ActionDialogComponent<TAction extends PuibeDialogActionTemplate<any, TDialogData>, TDialogData = unknown> {
    private readonly _injector = inject(Injector);

    @Input() title: DialogContent;
    @Input() subtitle: DialogContent;
    @Input() content: DialogContent;
    @Input() contentInputs: unknown;
    @Input() busy = false;
    @Input() hideCloseButton: boolean;

    data = inject<TDialogData>(DIALOG_DATA);
    dialogRef = inject(DialogRef);

    @Input()
    actions: DialogAction<TAction>[];

    public readonly commandInputSignal = model<CombinedCommandInput<TAction, any> | null>(null, { alias: 'command' });
    protected readonly commandSignal = command.fromInputSignal(this.commandInputSignal);

    set command(value: CombinedCommandInput<TAction, any>) {
        this.commandInputSignal.set(value);
    }

    get command(): Command<TAction, any> {
        return this.commandSignal();
    }

    // A signal: puibeHideIfEmptyText reports the change from a MutationObserver, possibly after the view was checked (NG0100)
    protected readonly isContentEmpty = signal(false);

    setActions(value: TAction[]) {
        runInInjectionContext(this._injector, () => {
            // Copies the actions: they may be reused for several dialogs (e.g. a constant), and the commands created here
            // belong to this dialog.
            this.actions = value.map((action) => {
                if (!action.command) {
                    return action;
                }
                const commandOptions = (action as { commandOptions?: CommandOptions<any> }).commandOptions;
                return {
                    ...action,
                    command: commandOptions
                        ? command.fromInput(action.command, commandOptions)
                        : command.fromInput(action.command),
                };
            }) as any;
        });
    }

    isActionSilent(action: TAction) {
        if (isCommand(action.command)) {
            return !action.command.options?.status?.blocking && !action.command.options?.status?.progressMessage;
        } else {
            return true;
        }
    }
}
