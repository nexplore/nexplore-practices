import { Component, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PuibeContainerDirective } from '../common/container.directive';
import { NgClass } from '@angular/common';

@Component({
    standalone: true,
    selector: 'puibe-sidenav-footer',
    templateUrl: './sidenav-footer.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [PuibeContainerDirective, TranslateModule, NgClass],
})
export class PuibeSidenavFooterComponent {
    /** This is a workaround for somehow href won't trigger page load */
    // TODO: Find out why this does not work
    @HostListener('click', ['$event'])
    onItemClick(event: MouseEvent) {
        const element = event.target;
        // Leave modified clicks (open in new tab/window) to the browser.
        const isModifiedClick = event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey;
        if (element instanceof HTMLAnchorElement && !isModifiedClick) {
            // Only basic hrefs don't work, routerLink DOES work, so exclude it here.
            // RouterLink calls preventDefault() on the anchor before the click bubbles up to this host.
            // (The former `ng-reflect-router-link` check no longer works, Angular stopped emitting ng-reflect-* attributes in v20.)
            if (element.href && !event.defaultPrevented) {
                window.open(element.href, element.target ?? '_self');
            }
        }
    }
}
