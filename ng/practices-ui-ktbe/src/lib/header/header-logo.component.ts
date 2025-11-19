import { NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PuibeIconKtbeLogoComponent } from '../icons/icon-ktbe-logo.component';

@Component({
    standalone: true,
    selector: 'puibe-header-logo',
    templateUrl: './header-logo.component.html',
    imports: [NgIf, RouterLink, PuibeIconKtbeLogoComponent],
})
export class PuibeHeaderLogoComponent {
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
    image: string;

    @Input()
    alt: string;

    @Input()
    caption: string;

    @Output()
    clickLink = new EventEmitter<MouseEvent>();
}
