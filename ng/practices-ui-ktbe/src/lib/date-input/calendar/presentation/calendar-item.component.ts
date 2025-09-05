import { A11yModule } from '@angular/cdk/a11y';
import { NgClass } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { CalendarPeriodItem } from '../../services/calendar-period.service';

@Component({
    selector: 'puibe-calendar-item',
    templateUrl: './calendar-item.component.html',
    standalone: true,
    imports: [NgClass, A11yModule],
})
export class PuibeCalendarItemComponent {
    @HostBinding('class')
    readonly className = 'min-w-8 min-h-7 flex flex-1 justify-stretch';

    @HostBinding('class.max-h-8')
    @HostBinding('class.max-sm:max-h-9')
    @Input()
    restrictSizeToCircle: boolean;

    @Input()
    labelShort: string;

    @Input()
    label: string;

    @Input()
    selected: boolean;

    @Input()
    today: boolean;

    @Input()
    isOtherPeriod: boolean;

    @Input()
    disabled: boolean;

    @Input()
    focused: boolean;

    @Input()
    set periodItem(value: CalendarPeriodItem) {
        this.labelShort = value.labelShort;
        this.label = value.label;
        this.isOtherPeriod = value.isOtherPeriod;
    }

    isFocusable(): boolean {
        if (this.disabled) {
            return false;
        }

        return this.focused;
    }
}
