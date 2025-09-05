import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

@Component({
    standalone: true,
    selector: 'puibe-step-box',
    templateUrl: './step-box.component.html',
    imports: [NgClass],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeStepBoxComponent {
    @HostBinding('class') public className = 'max-w-[50rem]';
    @Input() public text: string;
    @Input() public step: number;
    @Input() public inactive: boolean;
}
