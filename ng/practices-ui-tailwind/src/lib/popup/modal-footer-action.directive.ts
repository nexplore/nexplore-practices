import { Directive, HostListener, Input, inject } from '@angular/core';

import { PuiModalService } from './modal.service';

@Directive({
    standalone: true,
    selector: 'button[puiModalFooterAction], a[puiModalFooterAction]',
})
export class PuiModalFooterActionDirective {
    private readonly _puiModalService = inject(PuiModalService);

    @HostListener('click')
    onClick() {
        if (this.shouldClose) {
            this._puiModalService.closeRef();
        }
    }

    @Input()
    shouldClose = true;
}

