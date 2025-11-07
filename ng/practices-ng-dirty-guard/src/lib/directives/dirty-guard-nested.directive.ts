import { Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { trace } from '@nexplore/practices-ng-logging';
import { PuiDirtyGuardService } from '../services/dirty-guard.service';

/**
 * Use this directive on a nested router-outlet, to make sure that the dirty guard is enabled and properly works for all sub-child routes.
 */
@Directive({
    standalone: true,
})
export class PuiNestedDirtyGuardDirective {
    constructor() {
        const routeGuardService = inject(PuiDirtyGuardService);
        const r = inject(RouterOutlet);

        r.activateEvents.pipe(takeUntilDestroyed()).subscribe((compInstance) => {
            routeGuardService.activateComponent(compInstance);
            trace('puiNestedDirtyGuard', 'component-activated', compInstance, this);
        });

        r.deactivateEvents.pipe(takeUntilDestroyed()).subscribe((compInstance) => {
            routeGuardService.deactivateComponent(compInstance);
            trace('puiNestedDirtyGuard', 'component-deactivated', compInstance, this);
        });
    }
}
