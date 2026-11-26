import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'pui-step-box',
    templateUrl: './step-box.component.html',
    imports: [NgClass],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuiStepBoxComponent {
    @HostBinding('class') public className = 'max-w-[50rem]';
    @Input() public text = '';
    @Input() public step = 0;
    @Input() public inactive = false;
}

