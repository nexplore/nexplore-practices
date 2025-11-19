import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { map } from 'rxjs';
import { PuibeIconSpinnerComponent } from '../icons/icon-spinner.component';
import { PuibeButtonDirective, Variant } from './button.directive';

@Component({
    standalone: true,
    selector: 'puibe-button-spinner',
    templateUrl: './button-spinner.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PuibeIconSpinnerComponent, NgIf, NgClass, AsyncPipe],
})
export class PuibeButtonSpinnerComponent {
    readonly busy$ = this._parentButtonDirective.busy$;
    readonly buttonSize$ = this._parentButtonDirective.size$;
    readonly fillClassName$ = this._parentButtonDirective.variant$.pipe(map((variant) => this.fillClassName(variant)));

    constructor(private _parentButtonDirective: PuibeButtonDirective) {}

    private fillClassName(variant: Variant) {
        switch (variant) {
            case 'primary':
            case 'danger-primary':
            case 'accept-primary':
                return 'fill-white';
            case 'secondary':
                return 'fill-black';
            case 'danger':
                return 'fill-red';
            case 'accept':
                return 'fill-green';
            default:
                return 'fill-black';
        }
    }
}
