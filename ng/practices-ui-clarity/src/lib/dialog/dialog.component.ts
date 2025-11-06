import { Component, EventEmitter, Inject, InjectionToken, Input, Optional, Output } from '@angular/core';
import { isObservable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DialogAction, DialogOptions } from '.';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { PortalModule } from '@angular/cdk/portal';
import { TranslateModule } from '@ngx-translate/core';

export const DIALOG_OPTIONS = new InjectionToken<{}>('DialogOptions');

@Component({
    selector: 'puiclr-dialog',
    imports: [CommonModule, ClarityModule, PortalModule, TranslateModule],
    templateUrl: './dialog.component.html',
    standalone: true,
})
export class DialogComponent {
    @Input()
    title: string;

    @Input()
    message: string;

    @Input()
    actions: DialogAction[];

    @Input()
    treatMessageAsHtml = false;

    @Output()
    dismissed = new EventEmitter<void>();

    @Output()
    completed = new EventEmitter<unknown>();

    currentlyRunningAction?: DialogAction;

    get opened() {
        return this.isOpened;
    }

    set opened(value: boolean) {
        this.isOpened = value;
        if (value === false) {
            this.dismissed.emit();
        }
    }

    private isOpened = true;

    constructor(@Optional() @Inject(DIALOG_OPTIONS) options?: DialogOptions) {
        if (options) {
            this.title = options.title;
            this.message = options.message;
            this.actions = options.dialogActions;
            this.treatMessageAsHtml = options.treatMessageAsHtml;
        }
    }

    onClick(action: DialogAction) {
        if (!action.handle) {
            this.completed.next(action);
        } else {
            const actionResult = action.handle();
            if (isObservable(actionResult)) {
                this.currentlyRunningAction = action;
                actionResult
                    .pipe(
                        finalize(() => {
                            this.currentlyRunningAction = null;
                        })
                    )
                    .subscribe((result) => {
                        this.completed.next(result);
                    });
            } else {
                this.completed.next(actionResult);
            }
        }
    }

    isBusy(action: DialogAction) {
        return this.currentlyRunningAction === action;
    }
}
