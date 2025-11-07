import { Directive, effect, ElementRef, HostListener, input, inject } from '@angular/core';
import { setHostClassNames } from '../../util/utils';

@Directive({
    standalone: true,
    selector: 'pui-table-row[puiTableRowActionTrigger]',
})
export class PuiTableRowActionTriggerDirective {
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @HostListener('click', ['$event.target'])
    onClick(elem) {
        if (this.puiTableRowActionTriggerDisabledSignal()) {
            return;
        }

        const colActionsElement = this._elementRef.nativeElement.querySelector('pui-table-col-actions');
        if (colActionsElement && colActionsElement.contains(elem)) {
            return;
        }

        const rowActionElement =
            this._elementRef.nativeElement.querySelector<HTMLAnchorElement | HTMLButtonElement>(
                ':is(a, button)[puiTableRowAction], [puiTableRowAction] :is(a, button)',
            ) ?? this._elementRef.nativeElement.querySelector<HTMLElement>('[puiTableRowAction]');

        if (rowActionElement && rowActionElement.contains(elem)) {
            return;
        }

        if (rowActionElement) {
            rowActionElement.click();
        }
    }

    public readonly puiTableRowActionTriggerDisabledSignal = input<boolean>(false, {
        alias: 'puiTableRowActionTriggerDisabled',
    });

    constructor() {
        effect(() => {
            const className = 'cursor-pointer hover:bg-very-light-secondary';
            setHostClassNames(
                {
                    [className]: !this.puiTableRowActionTriggerDisabledSignal(),
                },
                this._elementRef,
            );
        });
    }
}

