import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'pui-panel',
    templateUrl: './panel.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass],
})
export class PuiPanelComponent {
    @HostBinding('class')
    className = 'block';

    @Input() heading: string | null = null;

    @Input() headingLevel = '2';

    @Input() caption: string | null = null;

    @Input()
    variant: 'highlight' | 'white' = 'highlight';

    @Input()
    addItemPadding = true;
}

