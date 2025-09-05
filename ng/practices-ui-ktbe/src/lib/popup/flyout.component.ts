import { NgClass, NgIf } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuibeFlyoutService } from './flyout.service';
import { Dialog } from '@angular/cdk/dialog';

export const FLYOUT_PROVIDERS = [PuibeFlyoutService, Dialog];

@Component({
    standalone: true,
    selector: 'puibe-flyout',
    templateUrl: 'flyout.component.html',
    imports: [NgIf, NgClass, TranslateModule],
    encapsulation: ViewEncapsulation.None,
    styles: [
        // The following rule uses the :where() pseudo-class to match attribute selector, but keeping the low specificity, so it can be easily overriden.
        `
            puibe-flyout > *:where([puibeFlyoutTitle]),
            puibe-flyout-title {
                @apply text-h2 mx-6 mb-0 mt-6 font-light;
            }

            :where([puibeFlyoutContent]) {
                @apply m-6;
            }
        `,
    ],
})
export class PuibeFlyoutComponent {
    @Input() hideFooter = false;

    @Input() buttonsAlignment: 'start' | 'end' = 'start';

    constructor(private readonly _puibeFlyoutService: PuibeFlyoutService) {}

    closeFlyout(): void {
        this._puibeFlyoutService.closeRef();
    }
}
