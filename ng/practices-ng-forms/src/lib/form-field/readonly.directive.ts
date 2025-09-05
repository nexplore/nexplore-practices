import { Directive, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';

/**
 * Generic directive that allows to set a readonly state for a component, which can be inherited by all sub-components.
 *
 * The directive itself does not do anything, but it is up to the implementing component to use the `isReadonly$` observable to set the readonly state.
 */
@Directive({
    selector: '[puiReadonly]',
    standalone: true,
})
export class PuiReadonlyDirective {
    private readonly readonlySubject = new BehaviorSubject<boolean>(false);

    readonly isReadonly$ = this.readonlySubject.asObservable();

    readonly isReadonlySignal = toSignal(this.isReadonly$);

    @Input() set puiReadonly(readonly: boolean) {
        this.readonlySubject.next(readonly);
    }
}
