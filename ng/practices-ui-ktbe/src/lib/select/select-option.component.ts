import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'puibe-select-option',
    templateUrl: './select-option.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeSelectOptionComponent<T> {
    @Input()
    item!: T;

    @Input()
    bindLabel!: keyof T;

    @Input()
    bindMetadata!: keyof T;
}
