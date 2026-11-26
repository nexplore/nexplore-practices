import { Directive, HostBinding } from '@angular/core';

const className = 'mt-2 text-base font-light leading-tight';

@Directive({
    standalone: true,
    selector: '[puiNotice]',
})
export class PuiNoticeDirective {
    @HostBinding('class')
    className = className;
}

