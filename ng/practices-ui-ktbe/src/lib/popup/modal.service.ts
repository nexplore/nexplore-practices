import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, TemplateRef } from '@angular/core';

export type PuibeModalConfig<D = unknown> = DialogConfig<D>

@Injectable()
export class PuibeModalService {
    private readonly _defaultConfig: DialogConfig = {
        hasBackdrop: true,
        backdropClass: 'bg-dark-gray-50',
        panelClass: ['bg-white', 'shadow-lg'],
        autoFocus: 'dialog',
        restoreFocus: true,
        disableClose: false,
        ariaModal: true,
    };

    private _dialogRef: DialogRef;

    constructor(private readonly _dialog: Dialog) {}

    open<R = unknown, C = unknown, D = unknown>(
        componentOrTemplateRef: ComponentType<C> | TemplateRef<unknown>,
        config?: DialogConfig<D>
    ): DialogRef<R, C> {
        const mergedConfig = Object.assign({}, this._defaultConfig, config);
        this._dialogRef = this._dialog.open(componentOrTemplateRef, mergedConfig);

        return this._dialogRef as DialogRef<R, C>;
    }

    closeRef(): void {
        if (this._dialogRef != null) {
            this._dialogRef.close(this._dialogRef.config.data);
            this._dialogRef = null;
        }
    }
}
