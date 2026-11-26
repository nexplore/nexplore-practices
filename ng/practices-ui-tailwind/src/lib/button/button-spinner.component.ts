import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { PuiIconSpinnerComponent } from '../icons/icon-spinner.component';
import { PuiButtonDirective, Variant } from './button.directive';

@Component({
    standalone: true,
    selector: 'pui-button-spinner',
    templateUrl: './button-spinner.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PuiIconSpinnerComponent, NgClass, AsyncPipe],
})
export class PuiButtonSpinnerComponent {
    private _parentButtonDirective = inject(PuiButtonDirective);

    readonly busy$ = this._parentButtonDirective.busy$;
    readonly buttonSize$ = this._parentButtonDirective.size$;
    readonly fillClassName$ = this._parentButtonDirective.variant$.pipe(map((variant) => this.fillClassName(variant)));

    private fillClassName(variant: Variant) {
        switch (variant) {
            case 'primary':
            case 'danger-primary':
            case 'accept-primary':
                return 'fill-white';
            case 'secondary':
                return 'fill-black';
            case 'danger':
                return 'fill-brand';
            case 'accept':
                return 'fill-green';
            default:
                return 'fill-black';
        }
    }
}

