/* eslint-disable */

import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { delay } from 'rxjs';

@Component({
    selector: 'component-with-entrace-animation',
    template: ` @if (showDelayed()) {
        <div
            class="bg-cappuchino h3 flex min-h-52 min-w-52 items-center justify-center rounded-3xl shadow-inner"
            @enterAnimation
        >
            I am here
        </div>
        }`,
    animations: [
        trigger('enterAnimation', [
            transition(':leave', [
                animate('300ms cubic-bezier(.61,-0.25,.34,1.35)', // slight bounce
                keyframes([
                    style({
                        offset: 0,
                        opacity: 1,
                        clipPath: 'circle(100%)',
                    }),
                    style({
                        offset: 0.7,
                        opacity: 0.5,
                        clipPath: 'circle(1%)',
                    }),
                    style({
                        offset: 0.71,
                        overflow: 'hidden',
                        width: '*',
                        maxWidth: '*',
                    }),
                    style({
                        offset: 1,
                        opacity: 0,
                        width: 0,
                        maxWidth: 0,
                        transform: 'scale(0)',
                        overflow: 'hidden',
                        display: 'none',
                    }),
                ])),
            ]),
            transition(':enter', [
                animate('450ms cubic-bezier(.43,-0.31,.29,1.35)', // slight bounce
                keyframes([
                    style({
                        offset: 0,
                        display: 'none',
                        opacity: 0,
                        width: 0,
                    }),
                    style({
                        display: '*',
                        offset: 1 / 3,
                        opacity: 0,
                        width: 0,
                        transform: 'scale(0.9)',
                        overflow: 'hidden',
                        transformOrigin: 'center',
                    }),
                    style({
                        offset: 2 / 3,
                        opacity: 0,
                        width: '*',
                        transform: 'scale(0.9)',
                        overflow: '*',
                    }),
                    style({ offset: 1, opacity: 1, display: '*', width: '*', transform: 'scale(1)' }),
                ])),
            ]),
        ]),
    ],
    standalone: false
})
export class ComponentWithEntraceAnimation {
    show = input<boolean>(true);

    showDelayed = toSignal(toObservable(this.show).pipe(delay(10)));
}
