import { DomPortal, PortalModule } from '@angular/cdk/portal';
import { AsyncPipe, NgClass } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PuiSideNavigationComponent } from '../side-navigation/side-navigation.component';
import { PuiHeaderLogoComponent } from './header-logo.component';

import { BreakpointObserver, LayoutModule } from '@angular/cdk/layout';
import { Routes } from '@angular/router';
import { map } from 'rxjs/operators';
import { PuiObserveSizeDirective } from '../../lib/util/observe-size.directive';
import { PuiIconHamburgerComponent } from '../icons/icon-hamburger.component';
import { PuiShellService } from '../shell/shell.service';
import { PuiMetaRoute } from '../side-navigation/side-navigation.interface';
import { PUIBE_BREAKPOINT_MAX_W_LG } from '../util/constants';
import { PuiHeaderMobileMenuItemDirective } from './header-mobile-menu-item.directive';

@Component({
    standalone: true,
    selector: 'pui-header',
    templateUrl: './header.component.html',
    imports: [
        NgClass,
        AsyncPipe,
        TranslateModule,
        PuiSideNavigationComponent,
        PuiHeaderLogoComponent,
        PortalModule,
        LayoutModule,
        PuiIconHamburgerComponent,
        PuiHeaderMobileMenuItemDirective,
        PuiObserveSizeDirective,
    ],
})
export class PuiHeaderComponent implements OnInit {
    private breakpointObserver = inject(BreakpointObserver);
    private shellService = inject(PuiShellService);

    @Input()
    logoLink = '/';

    @Input()
    logoImage = '/assets/Kanton-Bern.svg';

    @Input()
    logoCaption = '';

    @Input()
    logoAltTitle = '';

    /**
     * If `true`, the side navigation will be displayed in an opened state
     */
    @Input()
    openSideNav = false;

    /**
     * If `true`, populates the side menu by reading out the global route configuration.
     * Alternatively, the menu can be populated by passing in a custom `Routes` object.
     * If `false`, the side menu has to be manually populated (Using [puiSideNavigation] selector)
     */
    @Input()
    routerConfig: boolean | Routes = true;

    /** Allows to customize the function, that is used to compare equality amongst route objects. By default, a partial subset of the route object is used. The result of this function is always JSON-serialized.*/
    @Input() routeComparableFn: (route: PuiMetaRoute<unknown>) => unknown = () => undefined;

    /**
     * If `true`, the gap between the main menu items will be smaller, allowing for more items to fit.
     */
    @Input()
    narrowMainMenu = false;

    /**
     * Allows to define a custom template that will be rendered for each item in the side navigation.
     *
     * Example:
     * ```html
     * <pui-header [sidemenuItemAfterTemplate]="sidemenuItemAfterTemplate">
     * ...
     * <!-- `item` is the `PuiMetaRoute` object from the routeConfig -->
     * <ng-template #sidemenuItemAfterTemplate let-item let-size="size">
     *   <pui-icon-enumeration
     *       class="ml-1 align-middle"
     *       [size]="size ?? IconSize.S"
     *       *ngIf="item.data.numberOfNotifications || item.data.numberOfErrors"
     *       [color]="item.data.numberOfErrors ? 'red' : 'bgdark'"
     *       [ariaLabel]="(item.data.numberOfErrors ? 'Labels.HasNumberOfErrors' : 'Labels.HasNumberOfNotifications') | translate
     *       "
     *       >{{
     *           item.data.numberOfErrors || item.data.numberOfNotifications || 0
     *       }}</pui-icon-enumeration
     *   >
     * </ng-template>
     * ```
     */
    @Input() sidemenuItemAfterTemplate: TemplateRef<unknown> | null = null;

    /**
     * Allows to define a custom footer template to be rendered inside the sidemenu (only visible in mobile view).
     *
     * Example:
     * ```html
     * <pui-header [sidemenuFooterTemplate]="sideNavFooterTemplate">
     * ...
     * <ng-template #sideNavFooterTemplate>
     *     <pui-sidenav-footer>
     *         <a puiFooterMenuItem>
     *             <pui-icon-login class="mr-1 inline-block w-5"></pui-icon-login>
     *             Login
     *         </a>
     *
     *         <div puiFooterMenuItem>
     *             <span>Mandat:</span>
     *             <select class="cursor-pointer font-bold">
     *                 <option>Mandat 1</option>
     *                 <option>Mandat 2</option>
     *             </select>
     *         </div>
     *
     *         <button
     *             type="button"
     *             puiFooterLanguageMenuItem
     *             *ngFor="let language of availableLanguages"
     *             (languageChanged)="onLanguageChange($event)"
     *             [isActive]="isLanguageActive(language)"
     *         >
     *             {{ language }}
     *         </button>
     *
     *         <span puiFooterCopyright>© 2025 - Nexplore</span>
     *     </pui-sidenav-footer>
     * </ng-template>
     * ```
     */
    @Input() sidemenuFooterTemplate: TemplateRef<unknown> | null = null;

    @Output()
    openSideNavChange = new EventEmitter<boolean>();

    @Output()
    sideNavItemClick = new EventEmitter<PuiMetaRoute>();

    @ViewChild('headerLogoWrapper', { static: true }) headerLogoWrapper!: ElementRef<HTMLElement>;

    headerLogoWrapperPortal: DomPortal | null = null;

    readonly isMobileBreakpoint$ = this.breakpointObserver.observe(PUIBE_BREAKPOINT_MAX_W_LG).pipe(
        map((state) => {
            return state.matches;
        }),
    );

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

