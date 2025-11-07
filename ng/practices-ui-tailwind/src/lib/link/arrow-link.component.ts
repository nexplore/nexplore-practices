import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PuiIconGoNextComponent } from '../icons/icon-go-next.component';

@Component({
    standalone: true,
    selector: 'pui-arrow-link',
    templateUrl: './arrow-link.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PuiIconGoNextComponent, RouterLink],
})
export class PuiArrowLinkComponent {
    @Input()
    routerLink: string;

    @Input()
    label: string;
}

