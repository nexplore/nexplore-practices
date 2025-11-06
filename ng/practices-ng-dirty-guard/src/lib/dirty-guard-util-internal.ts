import { inject, Injector, runInInjectionContext } from '@angular/core';
import { CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { firstValueFromMaybeAsync } from '@nexplore/practices-ng-common-util';
import { trace } from '@nexplore/practices-ng-logging';
import { distinctUntilChanged, isObservable, of, switchMap } from 'rxjs';
import { PuiDirtyGuardService } from './services/dirty-guard.service';
import { PuiGlobalRouteGuardService } from './services/global-route-guard.service';
import { AsyncResult, DirtyGuardConfig, DirtyGuardSupportedComponent, Result } from './services/types-internal';
import { PuiDirtyGuardHandler, PuiFormState } from './types';

/**
 * Evaluates whether the component can be deactivated when navigating away.
 *
 * It performs the following checks:
 * - If the component has a `canDeactivate` method, it calls it. Both sync and async results are supported.
 * - If the component has a `formState$` property, it checks the form state for dirtiness. If it's a BehaviorSubject, it will use the current value, otherwise it will subscribe to the observable.
 * - If none of the above is available, it calls the `requestUnsavedChangesDialogIfAnyDirty` method on the `PuiGlobalRouteGuardService`, which in turn calls any handler that was registered, for example by the `PuiFormDirective`, when `enableDirtyFormNavigationGuard` is enabled.
 *
 * Before calling the canDeactivate method, it checks if either the hierarchically injected `PuiDirtyGuardService` or the global `PuiGlobalRouteGuardService` is disabled.
 *
 * @param component
 * @param nextState
 * @param canDeactivateSelector
 */
export const evaluateDirtyGuardCanDeactivate = (
    component: DirtyGuardSupportedComponent,
    nextState: RouterStateSnapshot | null,
    canDeactivateSelector: (state: PuiFormState) => AsyncResult | Result
): Result | AsyncResult => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const hierarchicalDirtyGuardService = inject(PuiDirtyGuardService, { optional: true });
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const globalRouteGuardService = inject(PuiGlobalRouteGuardService);
    if (hierarchicalDirtyGuardService?.disabled || globalRouteGuardService?.disabled) {
        // Note, normally when disabled, the guard will already be removed and not even get called, this is like a "second line of defense".
        trace('puiGlobalDirtyGuard', 'disabled, returning true', {
            hierarchicalDirtyGuardService,
            globalRouteGuardService,
        });
        return true;
    } else if (component && 'canDeactivate' in component) {
        trace('puiGlobalDirtyGuard', 'calling canDeactivate of component', { component });
        const response = component.canDeactivate(nextState);
        if (response instanceof Promise || isObservable(response)) {
            return firstValueFromMaybeAsync(response).then(async (canDeactivate) => {
                trace('puiGlobalDirtyGuard', { canDeactivate });
                return firstValueFromMaybeAsync(canDeactivateSelector({ dirty: !canDeactivate }));
            });
        } else {
            // Make sure a sync value is also returned synchronously, in case it is called from beforeunload handler.
            return canDeactivateSelector({ dirty: !response });
        }
    } else if (component && 'formState$' in component) {
        trace('puiGlobalDirtyGuard', 'checking formState$', { component });
        if ('getValue' in component.formState$) {
            const value = component.formState$.getValue();
            trace('puiGlobalDirtyGuard', 'getValue', { value }, 'calling canDeactivateSelector');
            return canDeactivateSelector(value);
        } else {
            return component.formState$.pipe(
                distinctUntilChanged((a, b) => a?.dirty === b?.dirty),
                switchMap((state) => {
                    trace('puiGlobalDirtyGuard', 'got form state', { state }, 'calling canDeactivateSelector');
                    const result = canDeactivateSelector(state);
                    if (result instanceof Promise || isObservable(result)) {
                        return result;
                    } else {
                        return of(result);
                    }
                })
            );
        }
    } else {
        trace(
            'puiGlobalDirtyGuard',
            'no hierarchical guard, calling requestUnsavedChangesDialogIfAnyDirty on globalRouteGuardService'
        );
        return new Promise((resolve) => {
            globalRouteGuardService.requestUnsavedChangesDialogIfAnyDirty((result) => {
                trace('puiGlobalDirtyGuard', 'requestUnsavedChangesDialogIfAnyDirty result', { result });
                resolve(result);
            });
        });
    }
};

/**
 * Checks for component dirty state and shows a confirm message
 */
export function createPuiDirtyGuard(
    handler?: PuiDirtyGuardHandler | null
): CanDeactivateFn<DirtyGuardSupportedComponent> {
    handler = handler ?? inject(DirtyGuardConfig).evaluateDiscardChangesAsyncHandler;
    return (component, activatedRouteSnapshot, currentRouterState, nextRouterState) => {
        const injector = inject(Injector);
        return evaluateDirtyGuardCanDeactivate(component, nextRouterState, async (state) => {
            if (state?.dirty) {
                trace('puiGlobalDirtyGuard', 'is dirty, calling handler to check', { state, component, handler });
                const discardChanges = await firstValueFromMaybeAsync(
                    runInInjectionContext(injector, () =>
                        handler({
                            formState: state,
                            component,
                            activatedRouteSnapshot,
                            currentRouterState,
                            nextRouterState,
                        })
                    )
                );
                trace('puiGlobalDirtyGuard', 'handler result', { discardChanges });

                if (discardChanges) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        });
    };
}
