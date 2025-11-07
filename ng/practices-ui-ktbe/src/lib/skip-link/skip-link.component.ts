import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PuibeIconGoNextComponent } from '../icons/icon-go-next.component';

@Component({
    selector: 'puibe-skip-link',
    standalone: true,
    imports: [PuibeIconGoNextComponent],
    templateUrl: './skip-link.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuibeSkipLinkComponent {
    @Input() href: string;

    onClick(ev: Event) {
        if (this.href?.startsWith('#')) {
            setTimeout(() => {
                document.querySelector<HTMLElement>(this.href)?.focus();
            });
            ev.preventDefault();
        }
    }
}
