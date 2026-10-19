import { DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { RouterStateSnapshot } from '@angular/router';
import { PuiCanDeactivate, PuiDirtyGuardService } from '@nexplore/practices-ng-dirty-guard';
import { PuiMarkControlService } from '@nexplore/practices-ng-forms';
import { trace } from '@nexplore/practices-ng-logging';
import { Observable } from 'rxjs';
import type { SignalFormGroup } from '../nodes/nodes';

/**
 * @internal
 *
 * Returns the `PuiFormDirective` instance that is associated with the given form group.
 */
export function getPuiFormDirectiveForFormGroup(formGroup: unknown): PuiFormDirective | undefined {
    return (formGroup as any)?.$$puiFormDirective;
}

function assignPuiFormDirectiveToFormGroup(formGroup: SignalFormGroup<any>, directive: PuiFormDirective) {
    (formGroup as any).$$puiFormDirective = directive;
}

/**
 * This directive extends the functionality of a signal form group used as `[formGroup]` of a `form` element
 *
 * - It adds an `enableDirtyFormNavigationGuard` input that would trigger the dirty guard when the form is dirty.
 * - It adds a method to mark all controls of a form as touched via the `MarkControlService`.
 *
 * Validity and dirtiness are read from the signal form state, not from the rendered DOM like the Reactive Forms version,
 * so no status classes have to be configured.
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
    private readonly _elementRef = inject(ElementRef<HTMLElement>);

    /**
     * When set to `true`, the form dirty state will be tracked, and whenever the user tries to navigate away from the current page, the dirty guard will be triggered.
     */
    public readonly enableDirtyFormNavigationGuardSignal = input(false, { alias: 'enableDirtyFormNavigationGuard' });

    /**
     * The form group that is associated with this directive.
     */
    public readonly formGroupSignal = input<SignalFormGroup<any> | null>(null, { alias: 'formGroup' });

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

    /** Marks the form group and all form fields as touched. */
    public markAsTouched() {
        this.formGroupSignal()?.markAllAsTouched();
        this._markControlService.markAsTouched();
    }

    /** Returns whether the form is pristine or not. A form that is not attached to the DOM anymore counts as pristine. */
    public getIfAllRenderedControlsArePristine(): boolean {
        if (!this._elementRef.nativeElement.isConnected) {
            return true;
        }
        return this.formGroupSignal()?.pristine ?? true;
    }

    /** Returns whether the form is valid or not. A form that is not attached to the DOM anymore counts as valid. */
    public getIfAllRenderedControlsAreValid(): boolean {
        if (!this._elementRef.nativeElement.isConnected) {
            return true;
        }
        const form = this.formGroupSignal();
        return form ? !form.invalid : true;
    }
}
