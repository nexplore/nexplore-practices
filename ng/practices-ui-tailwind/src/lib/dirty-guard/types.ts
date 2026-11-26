import { ActivatedRouteSnapshot, MaybeAsync, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

export interface IPuiFormState {
    dirty: boolean;
}

export interface IHasDirtyFormState {
    readonly formState$: Observable<IPuiFormState> | { getValue: () => IPuiFormState };
}

export interface CanDeactivate {
    /**
     * If implemented, and a `puiGlobalDirtyGuard` is present on the parent `router-outlet`, then this method will be called before exiting a page.
     *
     * NOTICE: While you can return a async promise or observable, it will not work for the standart browser prompt when the tab/window gets closed.
     *
     * If you have a page-component that has a formular, we instead recommend implement the `IHasDirtyFormState` with the `$formState` property.
     */
    readonly canDeactivate: (nextState: RouterStateSnapshot) => Observable<boolean> | Promise<boolean> | boolean;
}

export type DirtyGuardSupportedComponent = IHasDirtyFormState | CanDeactivate;
export type AsyncResult = Observable<boolean | UrlTree> | Promise<boolean | UrlTree>;
export type Result = boolean | UrlTree;

export interface DirtyGuardComponentState {
    component: DirtyGuardSupportedComponent;
    dirty?: boolean;
    subscription?: Subscription;
}

export interface PuiDirtyGuardEvent<TService = any> {
    type:
        | 'enabled'
        | 'disabled'
        | 'component-activated'
        | 'component-deactivated'
        | 'initialized'
        | 'destroyed'
        | 'check'
        | 'checkDialogResult'
        | 'popstate'
        | 'before-unload';
    data?: unknown;
    service?: TService;
}

export type PuiDirtyGuardHandlerParams = {
    formState: IPuiFormState;
    component: DirtyGuardSupportedComponent;
    activatedRouteSnapshot: ActivatedRouteSnapshot;
    currentRouterState: RouterStateSnapshot;
    nextRouterState: RouterStateSnapshot;
};

export type PuiDirtyGuardHandler = (params: PuiDirtyGuardHandlerParams) => MaybeAsync<boolean>;

export type PuiDirtyGuardCanDeactivateFnConfig = {
    dirtyHandler?: PuiDirtyGuardHandler;
    logEvent?: (ev: PuiDirtyGuardEvent) => void;
};

