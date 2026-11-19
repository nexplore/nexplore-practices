import { Component, HostListener, ChangeDetectionStrategy, ElementRef, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { PuibeContainerDirective } from '../common/container.directive';
import { NgClass } from '@angular/common';

@Component({
    standalone: true,
    selector: 'puibe-sidenav-footer',
    templateUrl: './sidenav-footer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [PuibeContainerDirective, TranslatePipe, NgClass],
})
export class PuibeSidenavFooterComponent {
    private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);

    /** This is a workaround for somehow href won't trigger page load */
    // TODO: Find out why this does not work
    @HostListener('click', ['$event'])
    onItemClick(event: MouseEvent) {
        // Leave modified clicks (open in new tab/window) to the browser.
        const isModifiedClick = event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
        // Only basic hrefs don't work, routerLink DOES work, so exclude it here:
        // RouterLink calls preventDefault() on the anchor before the click bubbles up to this host.
        // (The former `ng-reflect-router-link` check no longer works, Angular stopped emitting ng-reflect-* attributes in v20.)
        if (isModifiedClick || event.defaultPrevented) {
            return;
        }

        // The click may land on content inside the link, e.g. an icon or a span.
        const anchor = event.target instanceof Element ? event.target.closest('a') : null;
        if (!anchor?.href || !this._host.nativeElement.contains(anchor)) {
            return;
        }

        // Links with another target (e.g. `_blank`) are opened by the browser itself. RouterLink does not prevent
        // the default for them either, so handling them here would open the link twice.
        if (anchor.target && anchor.target !== '_self') {
            return;
        }

        window.open(anchor.href, '_self');
    }
}
