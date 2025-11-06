import { Directive, HostListener, Input } from '@angular/core';

import { PuibeFlyoutService } from './flyout.service';

@Directive({
    standalone: true,
    selector: 'button[puibeFlyoutFooterAction], a[puibeFlyoutFooterAction]',
})
export class PuibeFlyoutFooterActionDirective {
    @HostListener('click')
    onClick() {
        if (this.shouldClose) {
            this._puibeFlyoutService.closeRef();
        }
    }

    @Input()
    shouldClose = true;

    constructor(private readonly _puibeFlyoutService: PuibeFlyoutService) {}
}
