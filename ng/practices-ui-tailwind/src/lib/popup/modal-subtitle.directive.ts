import { Component, Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puiModalSubtitle]',
})
export class PuiModalSubtitleDirective {
    @HostBinding('attr.role')
    readonly role = 'heading';

    @HostBinding('attr.aria-level')
    readonly ariaLevel = '2';
}

@Component({
    standalone: true,
    selector: 'pui-modal-subtitle',
    template: `<ng-content></ng-content>`,
    hostDirectives: [PuiModalSubtitleDirective],
})
export class PuiModalSubtitleComponent {}

