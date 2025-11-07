import { Directive, HostBinding } from '@angular/core';

const className = 'text-very-small font-light leading-normal';

@Directive({
    standalone: true,
    selector: '[puiFooterCopyright]',
})
export class PuiFooterCopyrightDirective {
    @HostBinding('class')
    className = className;
}

