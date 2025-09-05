import { Component, Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puibeModalTitle]',
})
export class PuibeModalTitleDirective {
    @HostBinding('attr.role')
    readonly role = 'heading';

    @HostBinding('attr.aria-level')
    readonly ariaLevel = '1';
}

@Component({
    standalone: true,
    selector: 'puibe-modal-title',
    template: `<ng-content></ng-content>`,
    hostDirectives: [PuibeModalTitleDirective],
})
export class PuibeModalTitleComponent {}
