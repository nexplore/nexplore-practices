import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { A11yModule } from '@angular/cdk/a11y';
import { PuiIconCloseComponent } from '../icons/icon-close.component';
import { PuiIconExplanationMarkComponent } from '../icons/icon-explanation-mark.component';


export const toastAnimation = trigger('displayToastAnimation', [
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
            ]),
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
            ]),
        ),
    ]),
]);

/**
 * Render a toast message with optional close button and actions.
 */
@Component({
    standalone: true,
    selector: 'pui-toast',
    templateUrl: './toast.component.html',
    imports: [
    NgClass,
    PuiIconCloseComponent,
    PuiIconExplanationMarkComponent,
    TranslateModule,
    A11yModule
],
    animations: [toastAnimation],
})
export class PuiToastComponent {
    protected currentShowState = true;

    /**
     * Whether the toast should be closeable by the user.
     */
    @Input()
    public closeable: boolean;

    /**
     * The color-variant of the toast.
     *
     * By default, the toast will have dark-highlight background.
     */
    @Input()
    public variant?: 'default' | 'success' | 'error' | 'info' = 'default';

    /**
     *  Whether the toast should show an alert icon.
     */
    @Input()
    public showAlertIcon = false;

    /**
     * Whether the toast should hide the screen reader hint.
     */
    @Input()
    public hideScreenReaderHint = false;

    /**
     * Additional hint text to be announced by screen readers. By default uses 'Practices.Labels_Hint'
     */
    @Input()
    public screenReaderHint: string | undefined;

    /**
     * Event emitted when the toast is dismissed.
     */
    @Output()
    public dismissed = new EventEmitter<void>();

    /**
     * Closes the toast and emits the dismissed event.
     */
    public close() {
        this.currentShowState = false;
        this.dismissed.emit();
    }
}

