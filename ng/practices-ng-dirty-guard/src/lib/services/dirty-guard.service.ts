import { Injectable, Injector, OnDestroy, runInInjectionContext, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, GuardsCheckStart, Route, Router } from '@angular/router';
import { firstValueFromMaybeAsync } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import { Observable } from 'rxjs';
import { createPuiDirtyGuard, evaluateDirtyGuardCanDeactivate } from '../dirty-guard-util-internal';
import { PuiDirtyGuardHandler } from '../types';
import { PuiGlobalRouteGuardService } from './global-route-guard.service';
import { DirtyGuardComponentState, DirtyGuardSupportedComponent } from './types-internal';

/**
 * This service is bound to the instance of the `puiGlobalDirtyGuard` directive.
 */
@Injectable({
    providedIn: null,
})
export class PuiDirtyGuardService implements OnDestroy {
    private _router = inject(Router);
    private globalRouteGuardService = inject(PuiGlobalRouteGuardService);
    private injector = inject(Injector);
    private parent = inject(PuiDirtyGuardService, { skipSelf: true, optional: true });

    private _activeComponentInstanceStates = new Array<DirtyGuardComponentState>();
    private _disabled = false;

    protected dirtyGuardHandler = createPuiDirtyGuard();

    public get disabled() {
        return this.globalRouteGuardService.disabled || this._disabled;
    }

    public set disabled(value: boolean) {
        this._disabled = value;

        if (!this.parent) {
            this.globalRouteGuardService.disabled = value;
        }
    }

    constructor() {
        this._ensureGlobalGuards();

        this.globalRouteGuardService.requestUnsavedChangesDialog$.pipe(takeUntilDestroyed()).subscribe((handler) => {
            trace('PuiDirtyGuardService', 'requestUnsavedChangesDialog$', handler);
            this._triggerUnsavedChangesHandlerForAnyRoute(handler);
        });
    }

    protected beforeUnloadHandler = (ev: BeforeUnloadEvent) => {
        if (this.disabled) {
            return;
        }

        for (const state of this._activeComponentInstanceStates) {
            if (state) {
                const dirty = state.dirty;

                if (
                    dirty ||
                    false ===
                        runInInjectionContext(this.injector, () =>
                            evaluateDirtyGuardCanDeactivate(state.component, null, (state) => !state.dirty)
                        )
                ) {
                    trace('PuiDirtyGuardService', 'beforeUnloadHandler', 'cancelling browser navigation');
                    ev.returnValue = '';
                    ev.preventDefault();
                    return;
                }
            }
        }

        trace('PuiDirtyGuardService', 'beforeUnloadHandler', 'allowing browser navigation');
    };

    activateComponent(component: DirtyGuardSupportedComponent | unknown) {
        if (component && typeof component === 'object' && ('canDeactivate' in component || 'formState$' in component)) {
            const state: DirtyGuardComponentState = { component: component as DirtyGuardSupportedComponent };

            if ('formState$' in component && component.formState$ instanceof Observable) {
                state.subscription = component.formState$.subscribe((s) => {
                    state.dirty = s.dirty;
                });
            }

            this._activeComponentInstanceStates.push(state);
        }
    }

    deactivateComponent(component: unknown) {
        const i = this._activeComponentInstanceStates.findIndex((s) => s.component === component);
        if (i !== -1) {
            const state = this._activeComponentInstanceStates[i];
            state.subscription?.unsubscribe();
            this._activeComponentInstanceStates.splice(i, 1);
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }

    setDirtyGuardHandler(value: PuiDirtyGuardHandler | null) {
        this.dirtyGuardHandler = createPuiDirtyGuard(value);
    }

    /** This will help ensure that routes are automatically protected.
     *
     * - A PuiDirtyGuard is applied to every route.
     * - Handles `window.onbeforeunload`
     *
     * To use this feature, your components need to implement one of these interfaces: `IHasDirtyFormState` or `CanDeactivate`
     **/
    private _ensureGlobalGuards() {
        this._router.events.pipe(takeUntilDestroyed()).subscribe((e) => {
            if (e instanceof GuardsCheckStart) {
                let lastChild: ActivatedRouteSnapshot = e.state.root;
                while (lastChild && lastChild.firstChild) {
                    lastChild = lastChild.firstChild;
                }

                if (lastChild && lastChild.routeConfig) {
                    this._ensureCanDeactivateGuards(lastChild.routeConfig);
                }
            }
        });

        window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }

    private _ensureCanDeactivateGuards(routeConfig: Route) {
        if (this.dirtyGuardHandler) {
            if (!routeConfig.canDeactivate) {
                routeConfig.canDeactivate = [];
            }

            const canDeactivateGuards = routeConfig.canDeactivate;

            if (!this.disabled) {
                // ensure that the "dirtyGuardHandler" is in effect.
                if (!canDeactivateGuards.find((o) => o === this.dirtyGuardHandler)) {
                    trace('PuiDirtyGuardService', 'ensureCanDeactivateGuards', 'registering guard', {
                        routeConfig,
                        canDeactivateGuards,
                    });
                    this._registerGuard(canDeactivateGuards);
                }
            } else {
                // If not enabled, remove the dirty guard
                this._removeGuards();
            }
        }
    }

    private _removeGuardsHandler = () => {};

    private _removeGuards() {
        this._removeGuardsHandler();
        this._removeGuardsHandler = () => {};
    }

    private _registerGuard(canDeactivateGuards: any[]) {
        canDeactivateGuards.push(this.dirtyGuardHandler);

        const removeDirtyGuards = this._removeGuardsHandler;
        this._removeGuardsHandler = () => {
            removeDirtyGuards();
            const i = canDeactivateGuards.indexOf(this.dirtyGuardHandler);
            if (i !== -1) {
                canDeactivateGuards.splice(i, 1);
            }
        };
    }

    private async _triggerUnsavedChangesHandlerForAnyRoute(handler: (discardChanges: boolean) => void) {
        if (!this.disabled) {
            let handled = false;
            trace(
                'PuiDirtyGuardService',
                '_triggerUnsavedChangesHandlerForAnyRoute',
                this._activeComponentInstanceStates
            );
            for (const state of this._activeComponentInstanceStates) {
                if (!state.dirty && !('formState$' in state.component) && !('canDeactivate' in state.component)) {
                    continue;
                } else {
                    trace('PuiDirtyGuardService', '_triggerUnsavedChangesHandlerForAnyRoute', 'checking', state);
                    await runInInjectionContext(this.injector, async () => {
                        const result = await firstValueFromMaybeAsync(
                            this.dirtyGuardHandler(
                                state.component,
                                null as any, // Our dirty guard handler does not use these params
                                null as any,
                                null as any
                            )
                        );

                        handled = true;

                        if (result) {
                            this.globalRouteGuardService.overrideDisableAllGuards = true;
                            await handler(true);
                        } else {
                            await handler(false);
                        }
                    });
                    break;
                }
            }

            if (!handled) {
                await handler(true);
            }
            setTimeout(() => {
                this.globalRouteGuardService.overrideDisableAllGuards = false;
            });
        } else {
            trace('PuiDirtyGuardService', '_triggerUnsavedChangesHandlerForAnyRoute', 'disabled');
        }
    }
}
