import { Directive } from '@angular/core';
import { PuiGlobalDirtyGuardDirective } from '@nexplore/practices-ng-dirty-guard';

/** This directive enables a global dirty guard over all routes */
@Directive({
    selector: 'router-outlet[puibeGlobalDirtyGuard]',

    hostDirectives: [
        {
            directive: PuiGlobalDirtyGuardDirective,
            inputs: ['dirtyGuardHandler', 'puiGlobalDirtyGuardDisabled: puibeGlobalDirtyGuardDisabled'],
        },
    ],
    standalone: true,
})
export class PuibeGlobalDirtyGuardDirective {}
