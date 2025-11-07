import { NgClass } from '@angular/common';
import { Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuiIconCloseComponent } from '../icons/icon-close.component';
import { PuiModalService } from './modal.service';
import { PUIBE_MODAL_CONFIG, PuiModalConfig } from './types';

@Component({
    standalone: true,
    selector: 'pui-modal',
    templateUrl: 'modal.component.html',
    imports: [NgClass, TranslateModule, PuiIconCloseComponent],
    encapsulation: ViewEncapsulation.None,
    styles: [
        // The following rule uses the :where() pseudo-class to match attribute selector, but keeping the low specificity, so it can be easily overriden.
        `
            @reference '../../styles.css';
            pui-modal > [part='title-bar'] > *:where([puiModalTitle]),
            pui-modal-title {
                @apply text-h2 mx-6 mb-0 mt-6 font-light;
            }

            pui-modal > *:where([puiModalSubtitle]),
            pui-modal-subtitle {
                @apply mx-6 text-base font-light not-italic;
            }

            :where([puiModalContent]) {
                @apply m-6;
            }
        `,
    ],
})
export class PuiModalComponent {
    private readonly _puiDialogService = inject(PuiModalService);

    private readonly config = inject<PuiModalConfig>(PUIBE_MODAL_CONFIG, { optional: true });

    @Input() hideCloseButton = false;

    @Input() hideDoubleDividerLine = false;

    @Input() buttonsAlignment: 'start' | 'end' = this.config?.buttonsAlignment ?? 'start';

    closeModal(): void {
        this._puiDialogService.closeRef();
    }
}

