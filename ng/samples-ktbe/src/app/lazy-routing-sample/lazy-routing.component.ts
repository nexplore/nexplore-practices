import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-lazy-routing-sample',
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `HELLO WORLD FROM LAZY MODULE`,
})
export class LazyRoutingSampleComponent {}
