import { Component, Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puibeFlyoutTitle]',
})
export class PuibeFlyoutTitleDirective {
    @HostBinding('attr.role')
    readonly role = 'heading';

    @HostBinding('attr.aria-level')
    readonly ariaLevel = '2';
}

@Component({
    standalone: true,
    selector: 'puibe-flyout-title',
    template: `<ng-content></ng-content>`,
    hostDirectives: [PuibeFlyoutTitleDirective],
})
export class PuibeFlyoutTitleComponent {}
