import { DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { RouterStateSnapshot } from '@angular/router';
import { PuiCanDeactivate, PuiDirtyGuardService } from '@nexplore/practices-ng-dirty-guard';
import { trace } from '@nexplore/practices-ng-logging';
import { Observable } from 'rxjs';
import {
    DIRTY_CONTROL_DEFAULT_SELECTOR,
    INVALID_CONTROL_DEFAULT_SELECTOR,
    PuiFormStateConfig,
} from '../form-state/form-state.types';
import { PuiMarkControlService } from './mark-control.service';

/**
 * @internal
 *
 * Returns the `PuiFormDirective` instance that is associated with the given `formGroup`.
 *
 * Internally the `PuiFormDirective` is assigned to the `formGroup` via a private property.
 */
export function getPuiFormDirectiveForFormGroup(formGroup: FormGroup | unknown): PuiFormDirective | undefined {
    return (formGroup as any).$$puiFormDirective;
}

/**
 * @internal
 *
 * Assigns the given `PuiFormDirective` to the given `formGroup`.
 */
function assignPuiFormDirectiveToFormGroup(formGroup: FormGroup, directive: PuiFormDirective) {
    (formGroup as any).$$puiFormDirective = directive;
}

/**
 * This directive extends the functionality of the angular `formGroup`
 *
 * - It adds an `enableDirtyFormNavigationGuard` input that would trigger the dirty guard when the form is dirty.
 * - It adds a method to mark all controls of a form as touched via the `MarkControlService`.
 *
 * @example
 * ```html
 * <form [formGroup]="myFormGroup" puiForm [enableDirtyFormNavigationGuard]="true">
 *   ...
 * </form>
 * ```
 */
@Directive({
    standalone: true,
    selector: '[formGroup][puiForm]',
    providers: [PuiMarkControlService],
})
export class PuiFormDirective implements PuiCanDeactivate {
    private readonly _markControlService = inject(PuiMarkControlService);
    private readonly _formGroupDirective = inject(FormGroupDirective);
    private readonly _elementRef = inject(ElementRef<HTMLElement>);
    private readonly _formStateConfig = inject(PuiFormStateConfig, { optional: true });

    /**
     * When set to `true`, the form dirty state will be tracked, and whenever the user tries to navigate away from the current page, the dirty guard will be triggered.
     */
    public readonly enableDirtyFormNavigationGuardSignal = input(false, { alias: 'enableDirtyFormNavigationGuard' });

    /**
     * The form group that is associated with this directive.
     */
    public readonly formGroupSignal = input<FormGroup | null>(null, { alias: 'formGroup' });

    public constructor() {
        const destroyRef = inject(DestroyRef);
        const dirtyGuardService = inject(PuiDirtyGuardService, { optional: true });
        const elementRef = inject(ElementRef);
        effect(() => {
            if (this.enableDirtyFormNavigationGuardSignal()) {
                trace('puiForm', 'enableDirtyFormNavigationGuard - activating', elementRef.nativeElement);
                dirtyGuardService?.activateComponent(this);
            } else {
                trace('puiForm', 'enableDirtyFormNavigationGuard - deactivating', elementRef.nativeElement);
                dirtyGuardService?.deactivateComponent(this);
            }
        });

        destroyRef.onDestroy(() => {
            trace('puiForm', 'enableDirtyFormNavigationGuard - destroyed', elementRef.nativeElement);
            dirtyGuardService?.deactivateComponent(this);
        });

        effect(() => {
            const formGroup = this.formGroupSignal();

            if (formGroup) {
                assignPuiFormDirectiveToFormGroup(formGroup, this);
            }
        });
    }

    /**
     * @internal
     * Implements PuiCanDeactivate
     **/
    public canDeactivate(_nextState: RouterStateSnapshot | null): Observable<boolean> | Promise<boolean> | boolean {
        return this.getIfAllRenderedControlsArePristine();
    }

    public markAsTouched() {
        this._markControlService.markAsTouched();
    }

    /**
     * Returns whether the form is pristine or not.
     *
     * Checks the actual rendered DOM for dirty elements.
     **/
    public getIfAllRenderedControlsArePristine(): boolean {
        if (!this._elementRef.nativeElement.isConnected) {
            trace('puiForm', 'getIfAllRenderedControlsArePristine', 'form not connected');
            return true;
        }

        const hasDirtyElement = this._elementRef.nativeElement.querySelector(
            this._formStateConfig?.dirtyElementSelector ?? DIRTY_CONTROL_DEFAULT_SELECTOR
        );
        trace('puiForm', 'getIfAllRenderedControlsArePristine', { hasDirtyElement }, this._elementRef.nativeElement);
        return !hasDirtyElement;
    }

    /**
     * Returns whether the form is valid or not.
     *
     * Checks the actual rendered DOM for invalid elements.
     */
    public getIfAllRenderedControlsAreValid(): boolean {
        if (!this._elementRef.nativeElement.isConnected) {
            return true;
        }

        if (this._formGroupDirective.errors) {
            return false;
        }

        const hasInvalidElement = this._elementRef.nativeElement.querySelector(
            this._formStateConfig?.invalidElementSelector ?? INVALID_CONTROL_DEFAULT_SELECTOR
        );
        trace('puiForm', 'getIfAllRenderedControlsAreValid', { hasInvalidElement }, this._elementRef.nativeElement);
        return !hasInvalidElement;
    }
}
