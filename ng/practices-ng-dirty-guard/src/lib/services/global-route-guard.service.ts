import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PuiGlobalRouteGuardService {
    private _disableAllGuards = false;

    /**
     * If set to true, all guards will be disabled.
     */
    public set disabled(value: boolean) {
        this._disableAllGuards = value;
    }

    public get disabled() {
        return this.overrideDisableAllGuards || this._disableAllGuards;
    }

    public overrideDisableAllGuards?: boolean;

    private _requestUnsavedChangesDialogSubject = new Subject<(canDeactivate: boolean) => void>();
    readonly requestUnsavedChangesDialog$ = this._requestUnsavedChangesDialogSubject.asObservable();

    /**
     * Sends a request to all active dirty guards to show a dialog if there are any dirty forms.
     *
     * @param handler The handler will be called with the result of the dialog. `true` if the user wants to discard changes, `false` if the user wants to stay on the page.
     */
    readonly requestUnsavedChangesDialogIfAnyDirty = (handler: (canDeactivate: boolean) => void) => {
        this._requestUnsavedChangesDialogSubject.next(handler);
    };
}
