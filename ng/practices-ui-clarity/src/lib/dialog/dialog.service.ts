import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { ApplicationRef, ComponentFactoryResolver, Inject, Injectable, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { from, merge, Observable, ObservableInput, of } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

import { DialogAction, DialogOptions } from '.';
import { LocalizationKeys } from '../localization-keys';
import { DIALOG_OPTIONS, DialogComponent } from './dialog.component';

@Injectable({
    providedIn: 'root',
})
export class DialogService {
    private document: Document;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector,
        private translateService: TranslateService,
        @Inject(DOCUMENT) document: any
    ) {
        this.document = document as Document;
    }

    showMessage<T = unknown>(
        title: string,
        message: string,
        dialogActions: DialogAction<T>[],
        treatMessageAsHtml?: boolean
    ): Observable<T> {
        const portalHost = this.createPortalHost();
        const dialogOptions: DialogOptions = {
            title,
            message,
            dialogActions,
            treatMessageAsHtml,
        };

        const injector = this.createDialogInjector(dialogOptions);
        const portal = new ComponentPortal(DialogComponent, null, injector);

        return new Observable<T>((observer) => {
            const dialogRef = portalHost.attach(portal);

            return merge(dialogRef.instance.dismissed.pipe(map(() => null)), dialogRef.instance.completed)
                .pipe(
                    take(1),
                    tap((value) => {
                        portalHost.detach();
                        observer.next(value as T);
                        observer.complete();
                    })
                )
                .subscribe(observer);
        });
    }

    alert(
        title: string,
        message: string,
        okLabel?: string,
        okButtonClass?: string,
        treatMessageAsHtml?: boolean
    ): Observable<void> {
        const okAction: DialogAction = {
            label: okLabel ?? this.translateService.instant(LocalizationKeys.YES_LABEL),
            class: okButtonClass ?? 'btn-primary',
        };

        return this.showMessage(title, message, [okAction], treatMessageAsHtml).pipe(map(() => null));
    }

    alertAsync<T = unknown>(
        title: string,
        message: string,
        okAsyncHandler: () => ObservableInput<T>,
        okLabel?: string,
        okButtonClass?: string,
        treatMessageAsHtml?: boolean
    ): Observable<T> {
        const okAction: DialogAction<T> = {
            label: okLabel ?? this.translateService.instant(LocalizationKeys.YES_LABEL),
            class: okButtonClass ?? 'btn-primary',
            handle: () => from(okAsyncHandler()),
        };

        return this.showMessage(title, message, [okAction], treatMessageAsHtml);
    }

    confirm(
        title: string,
        message: string,
        confirmLabel?: string,
        cancelLabel?: string,
        confirmButtonClass?: string,
        treatMessageAsHtml?: boolean
    ): Observable<boolean> {
        const confirmAction: DialogAction<boolean> = {
            label: confirmLabel ?? this.translateService.instant(LocalizationKeys.YES_LABEL),
            class: confirmButtonClass ?? 'btn-primary',
            handle: () => true,
        };

        const cancelAction: DialogAction<boolean> = {
            label: cancelLabel ?? this.translateService.instant(LocalizationKeys.NO_LABEL),
            class: 'btn-outline',
            handle: () => false,
        };

        return this.showMessage(title, message, [cancelAction, confirmAction], treatMessageAsHtml).pipe(
            map((v) => v === true)
        );
    }

    confirmAsync<T = unknown>(
        title: string,
        message: string,
        confirmAsyncHandler: () => ObservableInput<T>,
        confirmLabel?: string,
        cancelLabel?: string,
        confirmButtonClass?: string,
        treatMessageAsHtml?: boolean
    ): Observable<boolean | T> {
        const confirmAction: DialogAction<T | boolean> = {
            label: confirmLabel ?? this.translateService.instant(LocalizationKeys.YES_LABEL),
            class: confirmButtonClass ?? 'btn-primary',
            handle: () => from(confirmAsyncHandler()).pipe(map((result) => (result === undefined ? true : result))),
        };

        const cancelAction: DialogAction<boolean> = {
            label: cancelLabel ?? this.translateService.instant(LocalizationKeys.NO_LABEL),
            class: 'btn-outline',
            handle: () => of(false),
        };

        return this.showMessage(title, message, [cancelAction, confirmAction], treatMessageAsHtml);
    }

    private createDialogInjector(data: DialogOptions): Injector {
        return Injector.create({
            name: 'DialogInjector',
            providers: [{ provide: DIALOG_OPTIONS, useValue: data }],
            parent: this.injector,
        });
    }

    private createPortalHost(): DomPortalOutlet {
        return new DomPortalOutlet(this.document.body, this.componentFactoryResolver, this.appRef, this.injector);
    }
}
