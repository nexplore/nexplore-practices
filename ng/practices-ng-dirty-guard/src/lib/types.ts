import { ActivatedRouteSnapshot, MaybeAsync, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DirtyGuardSupportedComponent } from './services/types-internal';

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

export interface PuiFormState {
    dirty: boolean;
}

export interface PuiHasDirtyFormState {
    readonly formState$: Observable<PuiFormState> | { getValue: () => PuiFormState };
}

export interface PuiCanDeactivate {
    /**
     * If implemented, and a `puiGlobalDirtyGuard` is present on the parent `router-outlet`, then this method will be called before exiting a page.
     *
     * NOTICE: While you can return a async promise or observable, it will not work for the standart browser prompt when the tab/window gets closed.
     */
    readonly canDeactivate: (nextState: RouterStateSnapshot | null) => Observable<boolean> | Promise<boolean> | boolean;
}

export interface PuiDirtyGuardConfig {
    evaluateDiscardChangesAsyncHandler: () => boolean | Observable<boolean> | Promise<boolean>;
}

export type PuiDirtyGuardHandlerParams = {
    formState: PuiFormState;
    component: DirtyGuardSupportedComponent;
    activatedRouteSnapshot: ActivatedRouteSnapshot;
    currentRouterState: RouterStateSnapshot;
    nextRouterState: RouterStateSnapshot;
};

export type PuiDirtyGuardHandler = (params: PuiDirtyGuardHandlerParams) => MaybeAsync<boolean>;
