import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'puibe-panel',
    templateUrl: './panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass],
})
export class PuibePanelComponent {
    @HostBinding('class')
    className = 'block';

    @Input() heading: string | null;

    @Input() headingLevel = '2';

    @Input() caption: string | null;

    @Input()
    variant: 'sand' | 'white' = 'sand';

    @Input()
    addItemPadding = true;
}
