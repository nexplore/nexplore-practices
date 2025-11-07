import { NgClass } from '@angular/common';
import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuibeIconCloseComponent } from '../icons/icon-close.component';
import { PuibeModalService } from './modal.service';
import { PUIBE_MODAL_CONFIG, PuibeModalConfig } from './types';

@Component({
    standalone: true,
    selector: 'puibe-modal',
    templateUrl: 'modal.component.html',
    imports: [NgClass, TranslateModule, PuibeIconCloseComponent],
    encapsulation: ViewEncapsulation.None,
    styles: [
        // The following rule uses the :where() pseudo-class to match attribute selector, but keeping the low specificity, so it can be easily overriden.
        `
            puibe-modal > [part='title-bar'] > *:where([puibeModalTitle]),
            puibe-modal-title {
                @apply text-h2 mx-6 mb-0 mt-6 font-light;
            }

            puibe-modal > *:where([puibeModalSubtitle]),
            puibe-modal-subtitle {
                @apply mx-6 text-base font-light not-italic;
            }

            :where([puibeModalContent]) {
                @apply m-6;
            }
        `,
    ],
})
export class PuibeModalComponent {
    private readonly _puibeDialogService = inject(PuibeModalService);

    private readonly config = inject<PuibeModalConfig>(PUIBE_MODAL_CONFIG, { optional: true });

    @Input() hideCloseButton = false;

    @Input() hideDoubleDividerLine = false;

    @Input() buttonsAlignment: 'start' | 'end' = this.config?.buttonsAlignment ?? 'start';

    closeModal(): void {
        this._puibeDialogService.closeRef();
    }
}
