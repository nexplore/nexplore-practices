import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { trace } from '@nexplore/practices-ng-logging';
import { PuiDirtyGuardService } from '../services/dirty-guard.service';
import { PuiDirtyGuardHandler } from '../types';

/** This directive enables a global dirty guard over all routes */
@Directive({
    selector: 'router-outlet[puiGlobalDirtyGuard]',
    providers: [PuiDirtyGuardService],
    standalone: true,
})
export class PuiGlobalDirtyGuardDirective implements OnInit, OnDestroy {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('puiGlobalDirtyGuardDisabled')
    set disabled(disabled: boolean) {
        this.routeGuardService.disabled = disabled;
        trace('puiGlobalDirtyGuard', 'disabled', disabled, this);
    }

    get disabled() {
        return this.routeGuardService.disabled;
    }

    /**
     * A custom handler that can be used to override the default dirty guard behavior.
     *
     * This method is called, whenever a navigation occuurs and the current page has unsaved changes (eg. is in a dirty state).
     *
     * By default, a dialog will be shown when the user tries to navigate away from a page with unsaved changes.
     */
    @Input()
    set dirtyGuardHandler(value: PuiDirtyGuardHandler | null) {
        this.routeGuardService.setDirtyGuardHandler(value);
    }

    constructor(readonly routeGuardService: PuiDirtyGuardService, r: RouterOutlet) {
        r.activateEvents.pipe(takeUntilDestroyed()).subscribe((compInstance) => {
            routeGuardService.activateComponent(compInstance);
            trace('puiGlobalDirtyGuard', 'component-activated', compInstance, this);
        });

        r.deactivateEvents.pipe(takeUntilDestroyed()).subscribe((compInstance) => {
            routeGuardService.deactivateComponent(compInstance);
            trace('puiGlobalDirtyGuard', 'component-deactivated', compInstance, this);
        });
    }

    ngOnInit(): void {
        trace('puiGlobalDirtyGuard', 'initialized', this);
    }

    ngOnDestroy(): void {
        trace('puiGlobalDirtyGuard', 'destroyed', this);
    }
}
