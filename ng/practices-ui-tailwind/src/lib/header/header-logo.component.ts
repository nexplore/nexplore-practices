import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    standalone: true,
    selector: 'pui-header-logo',
    templateUrl: './header-logo.component.html',
    imports: [RouterLink],
})
export class PuiHeaderLogoComponent {
    @HostListener('click', ['$event'])
    onItemClick(ev: MouseEvent) {
        const element = ev.composedPath().find((t) => t instanceof HTMLAnchorElement) as HTMLAnchorElement;
        if (element) {
            this.clickLink.emit(ev);
        }
    }

    @Input()
    link = '/';

    @Input()
    image = '';

    @Input()
    alt = '';

    @Input()
    caption = '';

    @Output()
    clickLink = new EventEmitter<MouseEvent>();
}

