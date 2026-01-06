/* eslint-disable */

import { Component, EventEmitter, Output, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { delay } from 'rxjs';
import { PuibeHideIfEmptyTextDirective } from './hide-if-empty-text.directive';

@Component({
    selector: 'component-wrapper',
    template: `<div puibeHideIfEmptyText (emptyTextChange)="emptyTextChange.emit($event)">
        <ng-content />
    </div>`,
    imports: [PuibeHideIfEmptyTextDirective],
    standalone: true,
})
export class ComponentWrapper {
    @Output()
    emptyTextChange = new EventEmitter<boolean>();
}

@Component({
    selector: 'component-projected-child',
    template: ` <div
        puibeHideIfEmptyText
        (emptyTextChange)="emptyTextChange.emit($event)"
        class="bg-cappuchino h3 flex min-h-52 min-w-52 items-center justify-center rounded-3xl shadow-inner"
    >
        @if (showDelayed()) { I am here }
    </div>`,
    imports: [PuibeHideIfEmptyTextDirective],
    standalone: true,
})
export class ComponentProjectedChild {
    @Output()
    emptyTextChange = new EventEmitter<boolean>();

    show = input<boolean>(true);

    showDelayed = toSignal(toObservable(this.show).pipe(delay(2000)));
}
