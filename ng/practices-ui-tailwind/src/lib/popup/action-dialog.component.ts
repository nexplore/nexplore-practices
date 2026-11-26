import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { Component, inject, Injector, Input, model, runInInjectionContext } from '@angular/core';
import { Command, command, isCommand } from '@nexplore/practices-ng-commands';
import { CombinedCommandInput } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';
import { PuiButtonDirective } from '../button/button.directive';
import { PuiIconSpinnerComponent } from '../icons/icon-spinner.component';
import { PuiHideIfEmptyTextDirective } from '../util/hide-if-empty-text.directive';
import { DialogAction, DialogContent, PuiDialogActionTemplate } from './action-dialog.types';
import { DialogTemplateContentComponent } from './dialog-template-content.component';
import { PuiModalContentDirective } from './modal-content.directive';
import { PuiModalFooterActionDirective } from './modal-footer-action.directive';
import { PuiModalSubtitleDirective } from './modal-subtitle.directive';
import { PuiModalTitleDirective } from './modal-title.directive';
import { PuiModalComponent } from './modal.component';

@Component({
    selector: 'pui-action-dialog',
    standalone: true,
    templateUrl: './action-dialog.component.html',
    imports: [
        PuiModalComponent,
        PuiModalContentDirective,
        PuiModalTitleDirective,
        PuiModalSubtitleDirective,
        PuiModalFooterActionDirective,
        PuiButtonDirective,
        TranslateModule,
        PuiIconSpinnerComponent,
        DialogTemplateContentComponent,
        PuiHideIfEmptyTextDirective,
    ],
})
export class ActionDialogComponent<TAction extends PuiDialogActionTemplate<any, TDialogData>, TDialogData = unknown> {
    private readonly _injector = inject(Injector);

    @Input() title: DialogContent | null = null;
    @Input() subtitle: DialogContent | null = null;
    @Input() content: DialogContent | null = null;
    @Input() contentInputs: unknown = {};
    @Input() busy = false;
    @Input() hideCloseButton = false;

    data = inject<TDialogData>(DIALOG_DATA);
    dialogRef = inject(DialogRef);

    @Input()
    actions: DialogAction<TAction>[] = [];

    public readonly commandInputSignal = model<CombinedCommandInput<TAction, any> | null>(null, { alias: 'command' });
    protected readonly commandSignal = command.fromInputSignal(this.commandInputSignal);

    set command(value: CombinedCommandInput<TAction, any>) {
        this.commandInputSignal.set(value);
    }

    get command(): Command<TAction, any> | null {
        return this.commandSignal();
    }

    protected isContentEmpty = false;

    setActions(value: TAction[]) {
        runInInjectionContext(this._injector, () => {
            this.actions = value as any;
            value.forEach((action) => {
                if (action.command) {
                    action.command = command.fromInput(action.command);
                }
            });
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

