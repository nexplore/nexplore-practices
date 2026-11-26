import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'pui-select-option',
    templateUrl: './select-option.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuiSelectOptionComponent<T> {
    @Input()
    item!: T;

    @Input()
    bindLabel!: keyof T;

    @Input()
    bindMetadata!: keyof T;
}

