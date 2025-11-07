import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PuibeIconArrowBreadcrumbComponent } from '../../icons/icon-arrow-breadcrumb.component';


@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'puibe-side-navigation-item',
    templateUrl: './side-navigation-item.component.html',
    imports: [
    NgClass,
    TranslateModule,
    TranslateModule,
    PuibeIconArrowBreadcrumbComponent,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet
],
})
export class PuibeSideNavigationItemComponent {
    @HostBinding('class')
    readonly className = 'flex gap-2 items-center outline-none bg-white';

    @HostBinding('attr.role')
    readonly role = 'listitem';

    @Input() routerLink: string | any[];

    @Input() href: string;

    @Input() target: string;

    @Input() rel: string;

    @Input() active: boolean;

    @Input() expanded: boolean;

    @Input() canExpand: boolean;

    @Input() autofocus: boolean;

    @Output() activate = new EventEmitter<Event>();

    /** @internal For debugging and diagnostics only (Angular Dev tools)  */
    @Input()
    data: any;

    isRouteActive: boolean;
}
