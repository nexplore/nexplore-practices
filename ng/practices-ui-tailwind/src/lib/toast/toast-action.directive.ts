import { Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: 'a[puiToastAction], button[puiToastAction]',
})
export class PuiToastActionDirective {
    @HostBinding('class')
    className =
        'cursor-pointer font-light no-underline max-w-fit after:block after:scale-x-0 after:border-b after:transition-all after:duration-150 after:ease-in-out hover:after:scale-x-100 focus:after:scale-x-100 active:after:scale-x-100 sm:text-right';
}

