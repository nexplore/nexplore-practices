import { Component, Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puiFlyoutTitle]',
})
export class PuiFlyoutTitleDirective {
    @HostBinding('attr.role')
    readonly role = 'heading';

    @HostBinding('attr.aria-level')
    readonly ariaLevel = '2';
}

@Component({
    standalone: true,
    selector: 'pui-flyout-title',
    template: `<ng-content></ng-content>`,
    hostDirectives: [PuiFlyoutTitleDirective],
})
export class PuiFlyoutTitleComponent {}

