import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PuiIconArrowBreadcrumbComponent } from '../../icons/icon-arrow-breadcrumb.component';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'pui-side-navigation-item',
    templateUrl: './side-navigation-item.component.html',
    imports: [
        NgClass,
        TranslateModule,
        TranslateModule,
        PuiIconArrowBreadcrumbComponent,
        RouterLink,
        RouterLinkActive,
        NgTemplateOutlet,
    ],
})
export class PuiSideNavigationItemComponent {
    @HostBinding('class')
    readonly className = 'flex gap-2 items-center outline-hidden bg-white';

    @HostBinding('attr.role')
    readonly role = 'listitem';

    @Input() routerLink: string | string[] = '';

    @Input() href: string | null = null;

    @Input() target: string | null = null;

    @Input() rel: string | null = null;

    @Input() active = false;

    @Input() expanded = false;

    @Input() canExpand = false;

    @Input() autofocus = false;

    @Output() activate = new EventEmitter<Event>();

    /** @internal For debugging and diagnostics only (Angular Dev tools)  */
    @Input()
    data: unknown;

    isRouteActive = false;
}

