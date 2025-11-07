import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PuiIconGoNextComponent } from '../icons/icon-go-next.component';

@Component({
    selector: 'pui-skip-link',
    standalone: true,
    imports: [PuiIconGoNextComponent],
    templateUrl: './skip-link.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuiSkipLinkComponent {
    @Input() href = '';

    onClick(ev: Event) {
        if (this.href?.startsWith('#')) {
            setTimeout(() => {
                document.querySelector<HTMLElement>(this.href)?.focus();
            });
            ev.preventDefault();
        }
    }
}

