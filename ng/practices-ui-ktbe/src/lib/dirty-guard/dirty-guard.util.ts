// import { inject, Injector, runInInjectionContext } from '@angular/core';
// import { CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
// import { distinctUntilChanged, firstValueFrom, isObservable, of, switchMap } from 'rxjs';
// import { PUIBE_DIALOG_PRESETS } from '../popup/action-dialog.types';
// import { PuibeDirtyGuardService } from './dirty-guard.service';
// import { PuibeGlobalRouteGuardService } from './global-route-guard.service';
// import {
//     AsyncResult,
//     DirtyGuardSupportedComponent,
//     IPuibeFormState,
//     PuibeDirtyGuardCanDeactivateFnConfig,
//     Result,
// } from './types';
//
// export const puibeEvaluateDirtyGuardCanDeactivate = (
//     component: DirtyGuardSupportedComponent | undefined,
//     nextState: RouterStateSnapshot,
//     canDeactivateSelector: (state: IPuibeFormState) => AsyncResult | Result
// ): Result | AsyncResult => {
//     // eslint-disable-next-line @typescript-eslint/no-use-before-define
//     const hierarchicalDirtyGuardService = inject(PuibeDirtyGuardService, { optional: true });
//     // eslint-disable-next-line @typescript-eslint/no-use-before-define
//     const globalRouteGuardService = inject(PuibeGlobalRouteGuardService);
//     if (hierarchicalDirtyGuardService?.disabled || globalRouteGuardService?.disabled) {
//         // Note, normally when disabled, the guard will already be removed and not even get called, this is like a "second line of defense".
//         return true;
//     } else if (component && 'canDeactivate' in component) {
//         return component.canDeactivate(nextState);
//     } else if (component && 'formState$' in component) {
//         if ('getValue' in component.formState$) {
//             const value = component.formState$.getValue();
//             return canDeactivateSelector(value);
//         } else {
//             return component.formState$.pipe(
//                 distinctUntilChanged((a, b) => a?.dirty === b?.dirty),
//                 switchMap((state) => {
//                     const result = canDeactivateSelector(state);
//                     if (result instanceof Promise || isObservable(result)) {
//                         return result;
//                     } else {
//                         return of(result);
//                     }
//                 })
//             );
//         }
//     } else {
//         return true;
//     }
// };
//
// /**
//  * Checks for component dirty state and shows a confirm message
//  */
// export const puibeDirtyGuardCanDeactivateFn =
//     ({ logEvent, dirtyHandler }: PuibeDirtyGuardCanDeactivateFnConfig): CanDeactivateFn<DirtyGuardSupportedComponent> =>
//     (component, activatedRouteSnapshot, currentRouterState, nextRouterState) => {
//         const injector = inject(Injector);
//
//         return puibeEvaluateDirtyGuardCanDeactivate(component, nextRouterState, async (state) => {
//             logEvent?.({ type: 'check', data: { state, component } });
//             if (state?.dirty) {
//                 const result = dirtyHandler
//                     ? runInInjectionContext(injector, () =>
//                           dirtyHandler({
//                               formState: state,
//                               component,
//                               activatedRouteSnapshot,
//                               currentRouterState,
//                               nextRouterState,
//                           })
//                       )
//                     : actionDlgService.showAsync(PUIBE_DIALOG_PRESETS.confirmDiscardUnsavedChanges(true));
//
//                 const discardChanges = isObservable(result)
//                     ? await firstValueFrom(result)
//                     : result instanceof Promise
//                     ? await result
//                     : result;
//
//                 logEvent?.({ type: 'checkDialogResult', data: { discardChanges } });
//
//                 if (discardChanges) {
//                     return true;
//                 } else {
//                     return false;
//                 }
//             } else {
//                 return true;
//             }
//         });
//     };
