import { Directive, HostListener, Input, inject } from '@angular/core';

import { PuiFlyoutService } from './flyout.service';

@Directive({
    standalone: true,
    selector: 'button[puiFlyoutFooterAction], a[puiFlyoutFooterAction]',
})
export class PuiFlyoutFooterActionDirective {
    private readonly _puiFlyoutService = inject(PuiFlyoutService);

    @HostListener('click')
    onClick() {
        if (this.shouldClose) {
            this._puiFlyoutService.closeRef();
        }
    }

    @Input()
    shouldClose = true;
}

