import { Directive, HostListener, Input, inject } from '@angular/core';

import { PuibeModalService } from './modal.service';

@Directive({
    standalone: true,
    selector: 'button[puibeModalFooterAction], a[puibeModalFooterAction]',
})
export class PuibeModalFooterActionDirective {
    private readonly _puibeModalService = inject(PuibeModalService);

    @HostListener('click')
    onClick() {
        if (this.shouldClose) {
            this._puibeModalService.closeRef();
        }
    }

    @Input()
    shouldClose = true;
}
