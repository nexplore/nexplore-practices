import { NgClass } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';

@Component({
    selector: 'puibe-calendar-row-label',
    templateUrl: './calendar-row-label.component.html',
    standalone: true,
    imports: [NgClass],
})
export class PuibeCalendarRowLabelComponent {
    @HostBinding('class')
    readonly className = 'min-w-8 min-h-7 flex flex-1 items-center justify-stretch font-light';

    @HostBinding('class.max-h-8')
    @HostBinding('class.max-sm:max-h-9')
    @Input()
    restrictSizeToCircle: boolean;

    @HostBinding('class.font-light')
    @Input()
    useFontLight: boolean;

    @Input()
    labelShort: string;

    @Input()
    label: string;
}
