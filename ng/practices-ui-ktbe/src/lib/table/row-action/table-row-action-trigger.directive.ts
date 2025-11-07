import { Directive, effect, ElementRef, HostListener, input, inject } from '@angular/core';
import { setHostClassNames } from '../../util/utils';

@Directive({
    standalone: true,
    selector: 'puibe-table-row[puibeTableRowActionTrigger]',
})
export class PuibeTableRowActionTriggerDirective {
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    @HostListener('click', ['$event.target'])
    onClick(elem) {
        if (this.puibeTableRowActionTriggerDisabledSignal()) {
            return;
        }

        const colActionsElement = this._elementRef.nativeElement.querySelector('puibe-table-col-actions');
        if (colActionsElement && colActionsElement.contains(elem)) {
            return;
        }

        const rowActionElement =
            this._elementRef.nativeElement.querySelector<HTMLAnchorElement | HTMLButtonElement>(
                ':is(a, button)[puibeTableRowAction], [puibeTableRowAction] :is(a, button)'
            ) ?? this._elementRef.nativeElement.querySelector<HTMLElement>('[puibeTableRowAction]');

        if (rowActionElement && rowActionElement.contains(elem)) {
            return;
        }

        if (rowActionElement) {
            rowActionElement.click();
        }
    }

    public readonly puibeTableRowActionTriggerDisabledSignal = input<boolean>(false, {
        alias: 'puibeTableRowActionTriggerDisabled',
    });

    constructor() {
        effect(() => {
            const className = 'cursor-pointer hover:bg-light-sand';
            setHostClassNames(
                {
                    [className]: !this.puibeTableRowActionTriggerDisabledSignal(),
                },
                this._elementRef
            );
        });
    }
}
