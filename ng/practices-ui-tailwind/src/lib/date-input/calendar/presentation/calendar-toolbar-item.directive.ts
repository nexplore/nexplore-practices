import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[puiCalendarToolbarItem]',
    standalone: true,
})
export class PuiCalendarToolbarItemDirective {
    @HostBinding('class')
    readonly className =
        'max-sm:text-h5 inline-flex p-1 transition duration-100 ease-in-out justify-center items-center';

    @HostBinding('class.cursor-not-allowed')
    @HostBinding('class.opacity-25')
    @Input()
    disabled = false;

    @Input()
    clickable = false;

    @HostBinding('class.cursor-pointer')
    @HostBinding('class.hover:bg-surface-hover')
    get isClickableAndNotDisabled() {
        return this.clickable && !this.disabled;
    }

    @HostBinding('class.cursor-default')
    get readonly(): boolean {
        return !this.clickable;
    }

    @HostBinding('attr.slot')
    @Input()
    slot: 'left' | 'right' | 'left-before' | 'left-after' = 'left';

    @HostBinding('class.rounded-full')
    @Input()
    roundedFull = false;

    @HostBinding('class.rounded-md')
    get roundedMd() {
        return !this.roundedFull;
    }
}

