import { Directive, HostListener, Input, inject } from '@angular/core';

import { PuibeFlyoutService } from './flyout.service';

@Directive({
    standalone: true,
    selector: 'button[puibeFlyoutFooterAction], a[puibeFlyoutFooterAction]',
})
export class PuibeFlyoutFooterActionDirective {
    private readonly _puibeFlyoutService = inject(PuibeFlyoutService);

    @HostListener('click')
    onClick() {
        if (this.shouldClose) {
            this._puibeFlyoutService.closeRef();
        }
    }

    @Input()
    shouldClose = true;
}
