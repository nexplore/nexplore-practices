import { Directive, HostBinding } from '@angular/core';

const className = 'text-very-small font-light leading-normal';

@Directive({
    standalone: true,
    selector: '[puibeFooterCopyright]',
})
export class PuibeFooterCopyrightDirective {
    @HostBinding('class')
    className = className;
}
