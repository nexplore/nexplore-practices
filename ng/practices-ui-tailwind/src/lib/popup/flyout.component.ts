import { Dialog } from '@angular/cdk/dialog';
import { NgClass } from '@angular/common';
import { Component, Input, ViewEncapsulation, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuiFlyoutService } from './flyout.service';

export const FLYOUT_PROVIDERS = [PuiFlyoutService, Dialog];

@Component({
    standalone: true,
    selector: 'pui-flyout',
    templateUrl: 'flyout.component.html',
    imports: [NgClass, TranslateModule],
    encapsulation: ViewEncapsulation.None,
    styles: [
        // The following rule uses the :where() pseudo-class to match attribute selector, but keeping the low specificity, so it can be easily overriden.
        `
            @reference '../../styles.css';
            pui-flyout > *:where([puiFlyoutTitle]),
            pui-flyout-title {
                @apply text-h2 mx-6 mb-0 mt-6 font-light;
            }

            :where([puiFlyoutContent]) {
                @apply m-6;
            }
        `,
    ],
})
export class PuiFlyoutComponent {
    private readonly _puiFlyoutService = inject(PuiFlyoutService);

    @Input() hideFooter = false;

    @Input() buttonsAlignment: 'start' | 'end' = 'start';

    closeFlyout(): void {
        this._puiFlyoutService.closeRef();
    }
}

