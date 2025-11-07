import { Component, Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puiModalTitle]',
})
export class PuiModalTitleDirective {
    @HostBinding('attr.role')
    readonly role = 'heading';

    @HostBinding('attr.aria-level')
    readonly ariaLevel = '1';
}

@Component({
    standalone: true,
    selector: 'pui-modal-title',
    template: `<ng-content></ng-content>`,
    hostDirectives: [PuiModalTitleDirective],
})
export class PuiModalTitleComponent {}

