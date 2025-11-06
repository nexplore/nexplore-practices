import { Directive, HostBinding } from '@angular/core';

const className = 'mt-2 text-base font-light leading-tight';

@Directive({
    standalone: true,
    selector: '[puibeNotice]',
})
export class PuibeNoticeDirective {
    @HostBinding('class')
    className = className;
}
