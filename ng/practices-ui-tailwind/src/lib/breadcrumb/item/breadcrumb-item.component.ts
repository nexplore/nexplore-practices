import { A11yModule } from '@angular/cdk/a11y';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PuiIconArrowBreadcrumbComponent } from '../../icons/icon-arrow-breadcrumb.component';
import { PuiIconHomeComponent } from '../../icons/icon-home.component';
import { PuiShellService } from '../../shell/shell.service';
import { PuiMetaRoutes } from '../../side-navigation/side-navigation.interface';

@Component({
    standalone: true,
    selector: 'pui-breadcrumb-item',
    templateUrl: './breadcrumb-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
        TranslateModule,
        PuiIconHomeComponent,
        PuiIconArrowBreadcrumbComponent,
        RouterLink,
        RouterLinkActive,
        NgTemplateOutlet,
        A11yModule,
    ],
})
export class PuiBreadcrumbItemComponent {
    private router = inject(Router, { optional: true });
    readonly shellService = inject(PuiShellService, { optional: true });

    @HostBinding('role')
    readonly role = 'listitem';

    @HostBinding('class')
    readonly className = 'flex gap-3 items-center group text-small  fill-dark-gray-50-solid ';

    readonly classNamesHomeIcon = 'mb-0.5 h-5 w-5 inline-flex items-center';

    readonly classNamesAnchor = 'text-small gap-1 flex items-center no-underline hover:fill-black';

    readonly classNamesFallback = 'text-dark-gray-50-solid text-small flex items-center no-underline';

    readonly classNamesActive = 'font-normal text-dark-gray-50-solid hover:cursor-text hover:text-dark-gray-50-solid';

    @Input()
    routerLink: string | string[] = '';

    @Input()
    routerConfig: PuiMetaRoutes | null = null;

    /** If true, then on click, will open the side-navigation instead of navigating to the link */
    @Input()
    shouldOpenSideNav = false;

    @Input()
    active = false;

    @Input()
    href: string | null = null;

    @Input()
    target: string | null = null;

    @Input()
    rel: string | null = null;

    @Input()
    hasHomeIcon: boolean | null = null;

    /** @internal For debugging and diagnostics only (Angular Dev tools) */
    @Input()
    data: unknown;

    get renderType() {
        if (this.shouldOpenSideNav) {
            return 'sideNav';
        } else if (this.href) {
            return 'anchor';
        } else if (this.routerLink || this.routerLink === '') {
            return 'routerLink';
        }
        return 'default';
    }

    get isHome() {
        if (this.hasHomeIcon !== undefined) {
            return this.hasHomeIcon;
        }

        if (this.routerLink instanceof Array) {
            const tree = this.router?.createUrlTree(this.routerLink);
            if (tree) {
                return tree.toString() === '/';
            } else {
                return this.routerLink.length === 0;
            }
        }
        return this.routerLink === '/';
    }

    openSidenav() {
        if (!this.shellService) {
            console.error('pui-breadcrumbs: Cannot call `openRouteInSideMenu` as PuiShellService not available!');
        } else {
            this.shellService.openRouteInSideMenu({
                routerLink: this.href ?? this.routerLink,
                routerConfig: this.routerConfig,
                disableExpandPathToCurrentUrl: true,
            });
        }
    }
}

