import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-long-loading-route-sample',
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `<h4>HELLO WORLD FROM LONG LOADING ROUTE</h4>`,
})
export class LongLoadingRouteComponent {}
