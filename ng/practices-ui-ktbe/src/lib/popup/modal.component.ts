import { NgClass } from '@angular/common';
import { Component, HostBinding, inject, Input, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
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

            :where(puibe-modal.puibe-modal-content-scroll > [puibeModalContent]) {
                @apply m-0 min-h-0 flex-auto overflow-auto px-6;
            }
        `,
    ],
})
export class PuibeModalComponent {
    private readonly config = inject<PuibeModalConfig>(PUIBE_MODAL_CONFIG, { optional: true });

    @Input() hideCloseButton = false;

    @Input() hideDoubleDividerLine = false;

    @Input() buttonsAlignment: 'start' | 'end' = this.config?.buttonsAlignment ?? 'start';

    /**
     * Lets the modal take its full (given) height, with only the `puibeModalContent` being scrollable, while the title and the footer stay visible.
     * The height of the modal has to be constrained, e.g. with `class="h-[80vh]"`.
     */
    @HostBinding('class.puibe-modal-content-scroll')
    @HostBinding('class.flex')
    @HostBinding('class.flex-col')
    @Input()
    enableContentScroll = false;

    constructor(private readonly _puibeDialogService: PuibeModalService) {}

    closeModal(): void {
        this._puibeDialogService.closeRef();
    }
}
