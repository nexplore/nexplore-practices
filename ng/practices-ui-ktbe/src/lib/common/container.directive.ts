import { Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puibeContainer]',
})
export class PuibeContainerDirective {
    @HostBinding('class')
    className = 'container mx-auto max-w-[1350px]';
}
