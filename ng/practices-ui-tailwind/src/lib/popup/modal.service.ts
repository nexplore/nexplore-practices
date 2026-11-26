import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, TemplateRef, inject } from '@angular/core';

export type PuiModalConfig<D = unknown> = DialogConfig<D>;

@Injectable()
export class PuiModalService {
    private readonly _dialog = inject(Dialog);

    private readonly _defaultConfig: DialogConfig = {
        hasBackdrop: true,
        backdropClass: 'bg-dark-gray-50',
        panelClass: ['bg-white', 'shadow-lg'],
        autoFocus: 'dialog',
        restoreFocus: true,
        disableClose: false,
        ariaModal: true,
    };

    private _dialogRef: DialogRef<unknown, unknown> | null = null;

    open<R = unknown, C = unknown, D = unknown>(
        componentOrTemplateRef: ComponentType<C> | TemplateRef<unknown>,
        config?: DialogConfig<D>,
    ): DialogRef<R, C> {
        const mergedConfig = { ...this._defaultConfig, ...config };
        // Use unknown generics to satisfy overload constraints; cast after
        this._dialogRef = this._dialog.open(componentOrTemplateRef as any, mergedConfig as any) as DialogRef<
            unknown,
            unknown
        >;
        return this._dialogRef as unknown as DialogRef<R, C>;
    }

    closeRef(): void {
        if (this._dialogRef) {
            this._dialogRef.close(this._dialogRef.config.data);
            this._dialogRef = null;
        }
    }
}

