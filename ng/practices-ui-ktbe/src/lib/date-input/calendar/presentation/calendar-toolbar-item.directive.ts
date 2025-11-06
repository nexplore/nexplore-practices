import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
    selector: '[puibeCalendarToolbarItem]',
    standalone: true,
})
export class PuibeCalendarToolbarItemDirective {
    @HostBinding('class')
    readonly className =
        'max-sm:text-h5 inline-flex p-1 transition duration-100 ease-in-out justify-center items-center';

    @HostBinding('class.cursor-not-allowed')
    @HostBinding('class.opacity-25')
    @Input()
    disabled: boolean;

    @Input()
    clickable: boolean;

    @HostBinding('class.cursor-pointer')
    @HostBinding('class.hover:bg-sand-hover')
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
    roundedFull: boolean;

    @HostBinding('class.rounded-md')
    get roundedMd() {
        return !this.roundedFull;
    }
}
