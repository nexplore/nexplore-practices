import { Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puiContainer]',
})
export class PuiContainerDirective {
    @HostBinding('class')
    className = 'container mx-auto max-w-[1350px]';
}

