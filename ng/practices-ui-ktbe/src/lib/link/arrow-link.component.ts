import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PuibeIconGoNextComponent } from '../icons/icon-go-next.component';
import { RouterLink } from '@angular/router';

@Component({
    standalone: true,
    selector: 'puibe-arrow-link',
    templateUrl: './arrow-link.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [PuibeIconGoNextComponent, RouterLink],
})
export class PuibeArrowLinkComponent {
    @Input()
    routerLink: string;

    @Input()
    label: string;
}
