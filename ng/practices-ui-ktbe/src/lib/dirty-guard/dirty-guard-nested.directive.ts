import { Directive } from '@angular/core';
import { PuiNestedDirtyGuardDirective } from '@nexplore/practices-ng-dirty-guard';

/**
 * Use this directive on nested`router`outlet`s, to make sure that the dirty guard is enabled and properly works for all sub-child routes.
 */
@Directive({
    selector: 'router-outlet[puibeNestedDirtyGuard]',
    hostDirectives: [PuiNestedDirtyGuardDirective],
    standalone: true,
})
export class PuibeNestedDirtyGuardDirective {}
