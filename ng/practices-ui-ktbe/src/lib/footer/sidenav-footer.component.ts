import { Component, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PuibeContainerDirective } from '../common/container.directive';
import { NgClass } from '@angular/common';

@Component({
    standalone: true,
    selector: 'puibe-sidenav-footer',
    templateUrl: './sidenav-footer.component.html',
    imports: [PuibeContainerDirective, TranslateModule, NgClass],
})
export class PuibeSidenavFooterComponent {
    /** This is a workaround for somehow href won't trigger page load */
    // TODO: Find out why this does not work
    @HostListener('click', ['$event.target'])
    onItemClick(element: HTMLElement) {
        if (element instanceof HTMLAnchorElement) {
            // Only basic hrefs don't work, routerLink DOES work, so exclude it here
            if (element.href && !element.hasAttribute('ng-reflect-router-link')) {
                window.open(element.href, element.target ?? '_self');
            }
        }
    }
}
