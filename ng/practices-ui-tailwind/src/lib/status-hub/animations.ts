import { trigger, transition, animate, style, keyframes } from '@angular/animations';

export const listEntryAnimation = trigger('listEntryAnimation', [
    transition(':leave', [
        animate(
            '250ms',
            keyframes([
                style({
                    opacity: 1,
                    height: '*',
                    transform: 'scale(1)',
                    overflow: 'hidden',
                    transformOrigin: 'bottom center',
                }),
                style({ opacity: 0, height: '*', transform: 'scale(0.5)' }),
                style({ opacity: 0, height: 0, transform: 'scale(0.5)', overflow: 'hidden' }),
            ])
        ),
    ]),
    transition(':enter', [
        animate(
            '350ms',
            keyframes([
                style({
                    offset: 0,
                    opacity: 0,
                    height: 0,
                    transform: 'scale(0.5)',
                    overflow: 'hidden',
                    transformOrigin: 'center',
                }),
                style({ offset: 0.5, opacity: 0, height: '*', transform: 'scale(0.5)' }),
                style({ offset: 1, opacity: 1, height: '*', transform: 'scale(1)', overflow: 'hidden' }),
            ])
        ),
    ]),
]);

export const scaleAnimation = trigger('scaleAnimation', [
    transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('150ms', style({ opacity: 1, transform: 'scale(1)' })),
    ]),
    transition(':leave', [animate('150ms', style({ opacity: 0, transform: 'scale(0)' }))]),
]);

export const slowFadeAnimation = trigger('slowFadeAnimation', [
    transition(':enter', [style({ opacity: 0 }), animate('2000ms', style({ opacity: 1 }))]),
    transition(':leave', [animate('150ms', style({ opacity: 0 }))]),
]);
