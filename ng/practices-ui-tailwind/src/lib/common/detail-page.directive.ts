import { Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[puiDetailPage]',
})
export class PuiDetailPageDirective {
    @HostBinding('class')
    className = 'mt-[2.8rem] md:mt-[7.2rem] lg:mt-[10.3rem]';
}

