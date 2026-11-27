import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { PuiFormularInvalidError } from '@nexplore/practices-ng-forms';
import { isTranslatableMessage, StatusError, StatusEventExt } from '@nexplore/practices-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PuibeExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { IconDirection, IconSize } from '../icons/icon.interface';
import { PuibeToastComponent } from '../toast/toast.component';
import { resolveLocalizedMessage } from '../status-hub/localized-message.utils';

export type StatusTemplateContext<TError = StatusError> = {
    $implicit: StatusEventExt<TError>;

    /** The resolved (translated) message of the status, if any */
    message?: string;
};

@Component({
    selector: 'puibe-status-toast',
    standalone: true,
    templateUrl: './status-toast.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [PuibeToastComponent, NgTemplateOutlet, PuibeExpansionPanelComponent, TranslateModule],
})
export class PuibeStatusToastComponent {
    private _translate = inject(TranslateService);

    readonly IconSize = IconSize;
    readonly IconDirection = IconDirection;

    @Input() status: StatusEventExt & { error?: any; dismiss?: () => void };

    @Input() errorTemplate: TemplateRef<StatusTemplateContext>;

    @Input() successTemplate: TemplateRef<StatusTemplateContext>;

    @Output() dismissed = new EventEmitter<void>();

    showDetails = false;

    onDismiss(): void {
        if (this.status?.dismiss) {
            this.status?.dismiss();
        }

        this.dismissed.emit();
    }

    getSuccessMessage(ev: StatusEventExt) {
        const successMessage = resolveLocalizedMessage(this._translate, ev.success);
        if (successMessage) {
            return successMessage;
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

    protected getErrorMessage(error: unknown): unknown {
        if (isTranslatableMessage(error)) {
            return resolveLocalizedMessage(this._translate, error);
        }

        return (error as { message?: unknown })?.message ?? error;
    }

    protected isFormularInvalidError(error: unknown): error is PuiFormularInvalidError {
        return error instanceof PuiFormularInvalidError;
    }

    private isDialogCloseResult(ev: StatusEventExt) {
        return typeof ev.result === 'object' && (ev.result as any)?.representsDialogClose;
    }
}
