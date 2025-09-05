import { DomPortal, PortalModule } from '@angular/cdk/portal';
import { AsyncPipe, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, Input, EventEmitter, Output, ElementRef, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuibeSideNavigationComponent } from '../side-navigation/side-navigation.component';
import { PuibeHeaderLogoComponent } from './header-logo.component';

import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { PuibeIconHamburgerComponent } from '../icons/icon-hamburger.component';
import { map } from 'rxjs/operators';
import { PuibeHeaderMobileMenuItemDirective } from './header-mobile-menu-item.directive';
import { Routes } from '@angular/router';
import { PuibeObserveSizeDirective } from '../../lib/util/observe-size.directive';
import { PuibeMetaRoute } from '../side-navigation/side-navigation.interface';
import { PUIBE_BREAKPOINT_MAX_W_LG } from '../util/constants';
import { PuibeShellService } from '../shell/shell.service';

@Component({
    standalone: true,
    selector: 'puibe-header',
    templateUrl: './header.component.html',
    imports: [
        NgClass,
        NgIf,
        AsyncPipe,
        TranslateModule,
        NgTemplateOutlet,
        PuibeSideNavigationComponent,
        PuibeHeaderLogoComponent,
        PortalModule,
        LayoutModule,
        PuibeIconHamburgerComponent,
        PuibeHeaderMobileMenuItemDirective,
        PuibeObserveSizeDirective,
    ],
})
export class PuibeHeaderComponent implements OnInit {
    @Input()
    logoLink = '/';

    @Input()
    logoImage = '/assets/Kanton-Bern.svg';

    @Input()
    logoCaption: string;

    @Input()
    logoAltTitle = '';

    /**
     * If `true`, the side navigation will be displayed in an opened state
     */
    @Input()
    openSideNav: boolean;

    /**
     * If `true`, populates the side menu by reading out the global route configuration.
     * Alternatively, the menu can be populated by passing in a custom `Routes` object.
     * If `false`, the side menu has to be manually populated (Using [puibeSideNavigation] selector)
     */
    @Input()
    routerConfig: boolean | Routes = true;

    /** Allows to customize the function, that is used to compare equality amongst route objects. By default, a partial subset of the route object is used. The result of this function is always JSON-serialized.*/
    @Input() routeComparableFn: (route: PuibeMetaRoute<unknown>) => any;

    /**
     * If `true`, the gap between the main menu items will be smaller, allowing for more items to fit.
     */
    @Input()
    narrowMainMenu: boolean;

    /**
     * Allows to define a custom template that will be rendered for each item in the side navigation.
     *
     * Example:
     * ```html
     * <puibe-header [sidemenuItemAfterTemplate]="sidemenuItemAfterTemplate">
     * ...
     * <!-- `item` is the `PuibeMetaRoute` object from the routeConfig -->
     * <ng-template #sidemenuItemAfterTemplate let-item let-size="size">
     *   <puibe-icon-enumeration
     *       class="ml-1 align-middle"
     *       [size]="size ?? IconSize.S"
     *       *ngIf="item.data.numberOfNotifications || item.data.numberOfErrors"
     *       [color]="item.data.numberOfErrors ? 'red' : 'anthrazit'"
     *       [ariaLabel]="(item.data.numberOfErrors ? 'Labels.HasNumberOfErrors' : 'Labels.HasNumberOfNotifications') | translate
     *       "
     *       >{{
     *           item.data.numberOfErrors || item.data.numberOfNotifications || 0
     *       }}</puibe-icon-enumeration
     *   >
     * </ng-template>
     * ```
     */
    @Input() sidemenuItemAfterTemplate: TemplateRef<unknown>;

    /**
     * Allows to define a custom footer template to be rendered inside the sidemenu (only visible in mobile view).
     *
     * Example:
     * ```html
     * <puibe-header [sidemenuFooterTemplate]="sideNavFooterTemplate">
     * ...
     * <ng-template #sideNavFooterTemplate>
     *     <puibe-sidenav-footer>
     *         <a puibeFooterMenuItem>
     *             <puibe-icon-login class="mr-1 inline-block w-5"></puibe-icon-login>
     *             Login
     *         </a>
     *
     *         <div puibeFooterMenuItem>
     *             <span>Mandat:</span>
     *             <select class="cursor-pointer font-bold">
     *                 <option>Mandat 1</option>
     *                 <option>Mandat 2</option>
     *             </select>
     *         </div>
     *
     *         <button
     *             type="button"
     *             puibeFooterLanguageMenuItem
     *             *ngFor="let language of availableLanguages"
     *             (languageChanged)="onLanguageChange($event)"
     *             [isActive]="isLanguageActive(language)"
     *         >
     *             {{ language }}
     *         </button>
     *
     *         <span puibeFooterCopyright>© 2019 - Kanton Bern</span>
     *     </puibe-sidenav-footer>
     * </ng-template>
     * ```
     */
    @Input() sidemenuFooterTemplate: TemplateRef<unknown>;

    @Output()
    openSideNavChange = new EventEmitter<boolean>();

    @Output()
    sideNavItemClick = new EventEmitter<PuibeMetaRoute>();

    @ViewChild('headerLogoWrapper', { static: true }) headerLogoWrapper: ElementRef<HTMLElement>;

    headerLogoWrapperPortal: DomPortal;

    readonly isMobileBreakpoint$ = this.breakpointObserver.observe(PUIBE_BREAKPOINT_MAX_W_LG).pipe(
        map((state) => {
            return state.matches;
        })
    );

    constructor(private breakpointObserver: BreakpointObserver, private shellService: PuibeShellService) {}

    ngOnInit() {
        this.headerLogoWrapperPortal = new DomPortal(this.headerLogoWrapper);
    }

    onOpenSideNavChange(open: boolean) {
        this.openSideNavChange.emit(open);
        this.openSideNav = open;
    }

    onClickHamburgerMenu() {
        // Open current route by default
        this.shellService.openRouteInSideMenu({ routePath: [] });
    }

    onClickLogoLink() {
        this.openSideNav = false;
    }
}
