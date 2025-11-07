import { animate, state, style, transition, trigger } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { CdkPortalOutlet, ComponentPortal, ComponentType, Portal, PortalModule } from '@angular/cdk/portal';
import { Component, EventEmitter, model, Output, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuiIconCloseComponent } from '../icons/icon-close.component';

@Component({
    selector: 'pui-side-overlay-panel',
    standalone: true,
    imports: [CdkPortalOutlet, PortalModule, PuiIconCloseComponent, A11yModule, TranslateModule],
    templateUrl: './side-overlay-panel.component.html',
    styles: [
        `
            @reference '../../styles.css';
            :where(pui-side-overlay-panel) {
                @apply h-full w-full;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('slideInOut', [
            state('in', style({ transform: 'translateX(0%)' })),
            transition(':enter', [style({ transform: 'translateX(100%)' }), animate('300ms ease-in')]),
            transition(':leave', [animate('300ms ease-out', style({ transform: 'translateX(100%)' }))]),
        ]),
    ],
})
export class PuiSideOverlayPanelComponent {
    public readonly isOpenSignal = model<boolean>(true);
    public readonly titleSignal = model<string>('');

    // Converting the output to new output-syntax will result in NG0953 runtime error (https://github.com/angular/angular/issues/60110)
    @Output()
    closed = new EventEmitter<void>();

    protected portal: Portal<unknown>;

    public loadContent(content: ComponentType<unknown>) {
        this.portal = new ComponentPortal(content);
    }

    public close() {
        this.isOpenSignal.set(false);
    }

    protected onAnimationDone(event: AnimationEvent & { toState: string }) {
        if (event.toState === 'void') {
            this.closed.emit();
        }
    }
}

