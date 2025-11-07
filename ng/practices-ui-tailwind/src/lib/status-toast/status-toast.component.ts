import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, TemplateRef } from '@angular/core';
import { PuiFormularInvalidError } from '@nexplore/practices-ng-forms';
import { StatusError, StatusEventExt } from '@nexplore/practices-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PuiExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { IconDirection, IconSize } from '../icons/icon.interface';
import { PuiToastComponent } from '../toast/toast.component';

export type StatusTemplateContext<TError = StatusError> = {
    $implicit: StatusEventExt<TError>;
};

@Component({
    selector: 'pui-status-toast',
    standalone: true,
    templateUrl: './status-toast.component.html',
    imports: [PuiToastComponent, NgTemplateOutlet, PuiExpansionPanelComponent, TranslateModule],
})
export class PuiStatusToastComponent {
    private _translate = inject(TranslateService);

    readonly IconSize = IconSize;
    readonly IconDirection = IconDirection;

    @Input() status?: StatusEventExt & { error?: any; dismiss?: () => void };

    @Input() errorTemplate?: TemplateRef<StatusTemplateContext>;

    @Output() dismissed = new EventEmitter<void>();

    showDetails = false;

    onDismiss(): void {
        if (this.status?.dismiss) {
            this.status?.dismiss();
        }

        this.dismissed.emit();
    }

    getSuccessMessage(ev: StatusEventExt) {
        if (typeof ev.success === 'string') {
            return ev.success;
        }

        if (ev.statusCategory && ev.result !== false && false === this.isDialogCloseResult(ev)) {
            // Notice the special check for result !== `false` which is the equivalent of an cancelled action, for example dialog cancel.
            switch (ev.statusCategory) {
                case 'action-delete':
                    return this._translate.instant('Practices.Labels_Status_Action_Delete_Success');
                case 'action-save':
                    return this._translate.instant('Practices.Labels_Status_Action_Save_Success');
            }
        }

        return '';
    }

    protected isFormularInvalidError(error: unknown): error is PuiFormularInvalidError {
        return error instanceof PuiFormularInvalidError;
    }

    private isDialogCloseResult(ev: StatusEventExt) {
        return typeof ev.result === 'object' && (ev.result as any)?.representsDialogClose;
    }
}

