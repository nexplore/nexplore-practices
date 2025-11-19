import { Directive, HostListener, Input } from '@angular/core';

import { PuibeModalService } from './modal.service';

@Directive({
    standalone: true,
    selector: 'button[puibeModalFooterAction], a[puibeModalFooterAction]',
})
export class PuibeModalFooterActionDirective {
    @HostListener('click')
    onClick() {
        if (this.shouldClose) {
            this._puibeModalService.closeRef();
        }
    }

    @Input()
    shouldClose = true;

    constructor(private readonly _puibeModalService: PuibeModalService) {}
}
