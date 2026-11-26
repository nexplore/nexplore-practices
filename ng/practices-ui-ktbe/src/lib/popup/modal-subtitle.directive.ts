import { Component, Directive, HostBinding, ChangeDetectionStrategy } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puibeModalSubtitle]',
})
export class PuibeModalSubtitleDirective {
    @HostBinding('attr.role')
    readonly role = 'heading';

    @HostBinding('attr.aria-level')
    readonly ariaLevel = '2';
}

@Component({
    standalone: true,
    selector: 'puibe-modal-subtitle',
    template: `<ng-content></ng-content>`,
    changeDetection: ChangeDetectionStrategy.Eager,
    hostDirectives: [PuibeModalSubtitleDirective],
})
export class PuibeModalSubtitleComponent {}
