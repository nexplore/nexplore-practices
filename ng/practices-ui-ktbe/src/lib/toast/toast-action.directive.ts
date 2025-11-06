import { Directive, HostBinding } from '@angular/core';

@Directive({
    standalone: true,
    selector: 'a[puibeToastAction], button[puibeToastAction]',
})
export class PuibeToastActionDirective {
    @HostBinding('class')
    className =
        'cursor-pointer font-light no-underline max-w-fit after:block after:scale-x-0 after:border-b after:transition-all after:duration-150 after:ease-in-out hover:after:scale-x-100 focus:after:scale-x-100 active:after:scale-x-100 sm:text-right';
}
