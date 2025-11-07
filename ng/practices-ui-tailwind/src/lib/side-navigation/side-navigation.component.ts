import { A11yModule } from '@angular/cdk/a11y';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewChildren,
    inject,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { DestroyService, TitleService } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';
import {
    BehaviorSubject,
    Observable,
    asyncScheduler,
    combineLatest,
    filter,
    map,
    observeOn,
    of,
    shareReplay,
    skip,
    startWith,
    switchMap,
    take,
    takeUntil,
} from 'rxjs';

import { RouterUtilService } from '../router-util.service';
import { PuiShellService } from '../shell/shell.service';
import { PUIBE_BREAKPOINT_MAX_W_LG } from '../util/constants';

import {
    applyUrlParams,
    collectRouteParams,
    getHrefRelativePath,
    getWindowHrefRelativePath,
} from '../util/router.utils';
import { compareUrlWithWildcards } from '../util/utils';
import { PuiSideNavigationItemComponent } from './item/side-navigation-item.component';
import { PuiSideNavigationPaneComponent, panelExpansionAnimation } from './pane/side-navigation-pane.component';
import { PuiMetaRoute, PuiMetaRoutes } from './side-navigation.interface';

const className = 'flex justify-start bg-[rgba(255,255,255,0.84)]';

type PuiMetaRouteExt = PuiMetaRoute & { pathFromRoot?: string[] };

type NavPane = { route: PuiMetaRouteExt; parents: PuiMetaRoute[]; comparableKey: string };

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'pui-side-navigation',
    templateUrl: './side-navigation.component.html',
    styles: [
        `
            /* TODO: Move to some global-css/helper ? */
            @media (max-width: 1180px) {
                [data-subtle-scroll-container]::-webkit-scrollbar {
                    height: 0px;
                    width: 6px; /* TODO: Originally we JUST wanted to hide the horizontal scrollbar, but it seems impossible, even when just setting the height, it will affect also the vertical scrollbar */
                }

                [data-subtle-scroll-container]::-webkit-scrollbar-thumb:hover {
                    background: rgba(112, 112, 112, 0.68);
                }

                [data-subtle-scroll-container]::-webkit-scrollbar-thumb {
                    background: rgba(112, 112, 112, 0.5);
                    border-radius: 2px;
                }
            }
        `,
    ],
    animations: [panelExpansionAnimation],
    imports: [
        NgClass,
        NgTemplateOutlet,
        AsyncPipe,
        TranslateModule,
        PuiSideNavigationPaneComponent,
        PuiSideNavigationItemComponent,
        A11yModule,
    ],
    providers: [DestroyService],
})
export class PuiSideNavigationComponent implements OnChanges {
    readonly title = inject(TitleService, { optional: true });
    private _router = inject(Router, { optional: true });
    private _activatedRoute = inject(ActivatedRoute, { optional: true });
    private _shellService = inject(PuiShellService, { optional: true });
    private _breakpointObserver = inject(BreakpointObserver);
    private _routerUtilService = inject(RouterUtilService);
    private _destroy$ = inject(DestroyService);

    get className() {
        return `${className} ${
            !this.noOverlay ? 'fixed top-0 bottom-0 left-0 overflow-x-auto w-screen h-screen z-50' : 'h-full'
        } ${this.open ? 'opacity-100' : '!w-0 opacity-0 hidden'}`;
    }

    private _openSubject = new BehaviorSubject<boolean>(false);
    readonly open$ = this._openSubject.asObservable();

    @Input() set open(v: boolean) {
        this._openSubject.next(v);
    }

    get open() {
        return this._openSubject.value;
    }

    @Input() itemAfterTemplate: TemplateRef<unknown> | null = null;

    @Input() sidemenuFooterTemplate: TemplateRef<unknown> | null = null;

    @Output() openChange = new EventEmitter<boolean>();

    @Output() itemClick = new EventEmitter<PuiMetaRoute>();

    @Input() noOverlay = false;

    @Input() noHeader = false;

    private _useRouterConfig: boolean | PuiMetaRoute[] = false;
    @Input() set useRouterConfig(v: boolean | PuiMetaRoute[]) {
        this._useRouterConfig = v;
        if (Array.isArray(v)) {
            this._routesSubject.next(v);
        } else {
            this._routesSubject.next(v ? this._router?.config : []);
        }
    }
    get useRouterConfig() {
        return this._useRouterConfig;
    }

    @Input() initialExpandedRoute: PuiMetaRoute | string | string[] | null = null;

    /** Allows to customize the function, that is used to compare equality amongst route objects*/
    @Input() routeComparableFn: ((route: PuiMetaRoute<unknown>) => unknown) | null = null;

    /** Allows to customize when an item should be marked active */
    @Input() isRouteActiveFn: ((route: PuiMetaRoute<unknown>, url: string) => boolean | null) | null = null;

    @ViewChildren(PuiSideNavigationPaneComponent) sidePaneComponents!: QueryList<PuiSideNavigationPaneComponent>;

    @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLElement>;

    private _expandedPathSubject = new BehaviorSubject<PuiMetaRoute[] | null>(null);
    set expandedPath(v: PuiMetaRoute[] | null) {
        this._expandedPathSubject.next(v);
    }
    get expandedPath() {
        return this._expandedPathSubject.value;
    }

    private _currentlyVisiblePaneRouteSubject = new BehaviorSubject<PuiMetaRoute | null>(null);
    set currentlyVisiblePaneRoute(v: PuiMetaRoute | null) {
        this._currentlyVisiblePaneRouteSubject.next(v);
    }
    get currentlyVisiblePaneRoute() {
        return this._currentlyVisiblePaneRouteSubject.value;
    }

    private _routesSubject = new BehaviorSubject<PuiMetaRoutes>([]);
    get routes() {
        return this._routesSubject.value;
    }

    readonly isMobileBreakpoint$ = this._breakpointObserver.observe(PUIBE_BREAKPOINT_MAX_W_LG).pipe(
        map((state) => {
            return state.matches;
        }),
    );

    readonly openedSidePanes$: Observable<NavPane[]> = combineLatest([
        this._routesSubject,
        this._expandedPathSubject,
        this._openSubject,
    ]).pipe(
        map(([routes, expandedPath, open]) =>
            open
                ? this._traverseAndFlattenRoutes(routes, {
                      expandedPath,
                  })
                : [],
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    readonly activeSidePane$ = combineLatest([
        this.openedSidePanes$,
        this._expandedPathSubject,
        this._currentlyVisiblePaneRouteSubject,
    ]).pipe(
        map(([openedSidePanes, expandedPath, currentlyVisiblePaneRoute]) =>
            this.getActivePane(openedSidePanes, { expandedPath, currentlyVisiblePaneRoute }),
        ),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    constructor() {
        const title = this.title;

        if (!title) {
            console.warn('<pui-side-navigation> requested TitleService is not provided.');
        }

        this._router?.events
            .pipe(
                filter((ev) => ev instanceof NavigationEnd),
                startWith(of(undefined)),
                takeUntil(this._destroy$),
            )
            .subscribe(() => {
                if (this.useRouterConfig) {
                    const path = this._getExpandedPathForCurrentRoute();
                    this.expandedPath = path;
                    this.currentlyVisiblePaneRoute = path?.slice(-1)[0] ?? null;
                }
            });

        this._shellService?.requestOpenRouteInSideMenu$
            .pipe(
                switchMap((options) =>
                    this.isMobileBreakpoint$.pipe(
                        take(1),
                        map((isMobileBreakpoint) => ({ options, isMobileBreakpoint })),
                    ),
                ),
                takeUntil(this._destroy$),
            )
            .subscribe(({ options, isMobileBreakpoint }) => {
                const expandedPathForCurrentRoute = this._getExpandedPathForCurrentRoute();
                const routePath = options.routePath;
                if (
                    !options.disableExpandPathToCurrentUrl &&
                    (routePath.length === 0 ||
                        (expandedPathForCurrentRoute.length > routePath.length &&
                            routePath.every((r, i) => expandedPathForCurrentRoute[i].path === r.path)))
                ) {
                    if (routePath.length === 0 && isMobileBreakpoint) {
                        // In mobile view, open only the main panel by default, otherwise users could get confused to land on a sub-pane
                        this.expandedPath = [];
                    } else {
                        // Current route is same but deeper than the requested route.
                        this.expandedPath = expandedPathForCurrentRoute;
                    }
                } else {
                    this.expandedPath = routePath;
                }

                this.currentlyVisiblePaneRoute = (this.expandedPath ?? [])?.slice(-1)[0] ?? null;
                this.open = true;
                this.openChange.emit(this.open);
            });
    }

    private _getExpandedPathForCurrentRoute(): PuiMetaRoute<unknown>[] {
        // Fallback when no route was found
        if (!this._router) {
            return [];
        }
        const rawUrl = this._router.url;
        const url = rawUrl === '/' ? getWindowHrefRelativePath() : getHrefRelativePath(rawUrl);
        return this._routerUtilService.getRoutesForUrl(url, this.routes ?? []);
    }

    readonly trackyByFn = (_: number, item: NavPane) => this._routeToComparable(item.route);

    ngOnChanges(_changes: SimpleChanges): void {
        if (this.open && !this.noOverlay) {
            this._scrollToOpenedNavPane();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.removeProperty('overflow');
        }
    }

    canExpand(route: PuiMetaRoute) {
        if (route.children?.length > 1) {
            return true;
        } else if (route.children?.length === 1) {
            return route.title !== route.children[0].title && route.path !== route.children[0].path;
        } else {
            return false;
        }
    }

    isExpanded(route: PuiMetaRoute, parents: PuiMetaRoute[], expandedPath?: PuiMetaRoute[]) {
        if (!this.canExpand(route)) {
            return false;
        }

        const pathToCheck = [...parents, route].filter((r) => r.path);
        expandedPath = (expandedPath ?? this._getExpandedPath()).filter((r) => r.path);
        const expandedPathLink = expandedPath.map((r) => r.path).join('/');

        return pathToCheck.every(
            (r, i) => expandedPath[i]?.path === r?.path || this._routeHasMatchingChildRedirects(r, expandedPathLink),
        );
    }

    private _getRouteParams(): Params {
        if (!this._activatedRoute) {
            return {};
        }
        return collectRouteParams(this._activatedRoute.snapshot);
    }

    private _routeHasMatchingChildRedirects(r: PuiMetaRoute<unknown>, url: string): unknown {
        const routeParams = this._getRouteParams();
        url = this._routerUtilService.normalizeUrlForComparision(url, routeParams);

        return r?.data?.subChildrenAliasUrls?.some((linkAlias) =>
            compareUrlWithWildcards(
                url,
                linkAlias instanceof RegExp
                    ? linkAlias
                    : this._routerUtilService.normalizeUrlForComparision(linkAlias, routeParams),
            ),
        );
    }

    getActivePane(
        navPanes: NavPane[],
        state: { expandedPath: PuiMetaRoute[]; currentlyVisiblePaneRoute: PuiMetaRoute },
    ): NavPane {
        const routes = navPanes.map((pane) => pane.route);
        return (
            navPanes.find((pane, i) =>
                this._isActivePane(
                    navPanes,
                    pane.route,
                    routes.slice(0, i),
                    state.expandedPath,
                    state.currentlyVisiblePaneRoute,
                ),
            ) ?? navPanes.slice(-1)[0]
        );
    }

    private _isActivePane(
        navPanes: NavPane[],
        route: PuiMetaRoute,
        parents: PuiMetaRoute[],
        expandedPath?: PuiMetaRoute[],
        currentlyVisiblePaneRoute?: PuiMetaRoute,
    ) {
        if (navPanes?.length === 1) {
            return true;
        }

        if ((currentlyVisiblePaneRoute ?? this.currentlyVisiblePaneRoute) === route) {
            return true;
        }

        const expanded = expandedPath ?? this._getExpandedPath();
        if (expanded.length <= 1 && !parents?.length) {
            return true;
        }

        if (expanded.slice(-1).map(this._routeToComparable).includes(this._routeToComparable(route))) {
            return true;
        }

        return false;
    }

    isActiveRoute(route: PuiMetaRoute, parents: PuiMetaRoute[]) {
        const routePath = this._getRouterLink([route, ...parents]).join('/');

        if (this.isRouteActiveFn) {
            const isActive = this.isRouteActiveFn(route, routePath);
            if (isActive !== null) {
                return isActive;
            }
        }

        const currentHrefPath = getWindowHrefRelativePath();
        if (currentHrefPath === routePath) {
            return true;
        }

        if (route.data?.link?.href ?? (route.redirectTo && typeof route.redirectTo === 'string')) {
            const redirect = route.data?.link?.href ?? (route.redirectTo as string);

            if (redirect.startsWith('http')) {
                const currentAbsoluteHref = window.location.href.split('?')[0];
                return compareUrlWithWildcards(currentAbsoluteHref, redirect);
            } else {
                const relativeRedirect = getHrefRelativePath(redirect);
                return compareUrlWithWildcards(currentHrefPath, relativeRedirect);
            }
        }

        return false;
    }

    mergeParents(child: PuiMetaRoute | PuiMetaRoute[], parents: PuiMetaRoute[]) {
        return [...parents, ...(Array.isArray(child) ? child : [child])];
    }

    onOverlayClick() {
        if (!this.noOverlay) {
            this.close();
        }
    }

    async onItemClick(child: PuiMetaRoute, ...parents: Array<PuiMetaRoute | PuiMetaRoute[]>) {
        if (this.canExpand(child)) {
            this.expandedPath = [...parents.flatMap((p) => (Array.isArray(p) ? p : [p])), child];
            await this._scrollToOpenedNavPane();
            this.currentlyVisiblePaneRoute = child;
        } else if ((typeof child.redirectTo === 'string' && child.redirectTo?.startsWith('http')) || child.data?.link) {
            if (!child.data?.link?.target || child.data?.link?.target === '_self') {
                window.location.href = child.data?.link?.href ?? (child.redirectTo as string);
            } else {
                window.open(child.data?.link?.href ?? (child.redirectTo as string), child.data?.link?.target);
            }

            this.close();
        } else {
            this.close();
        }

        this.itemClick.emit(child);
    }

    // TODO (15196): Future Improvement: Add further keyboard navigation like arrow left to go back. Regarding accessiblity https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#examples
    onEscape() {
        this.close();
    }

    onBack(pane: NavPane) {
        // Setup a subscription for the next update of the side panes
        const _backSub = this.openedSidePanes$
            .pipe(skip(1), take(1), observeOn(asyncScheduler), takeUntil(this._destroy$))
            .subscribe(() => {
                const sidePaneEl = this.sidePaneComponents
                    .toArray()
                    .filter((p) => p.open)
                    .slice(-1)[0];

                if (sidePaneEl) {
                    // Focus the item that was the parent for the previously opened nav-pane route
                    sidePaneEl.focusFirstItem(`[data-path="${pane.route.path}"]`);
                }
            });

        // Updating the expandedPath will trigger the subscription above
        this.expandedPath = pane.parents?.length ? pane.parents : [];
        this.currentlyVisiblePaneRoute = (this.expandedPath ?? []).slice(-1)[0] ?? null;
    }

    onOpenChange(open: boolean) {
        if (!open && !this.noOverlay) {
            this.close();
        }
    }

    isSubPane(_route: PuiMetaRoute, parents: PuiMetaRoute[]) {
        if (!parents?.length) {
            return false;
        }

        return true;
    }

    isLastPaneRoute(route: PuiMetaRoute) {
        if (!this.expandedPath?.length) {
            return true;
        }

        const lastRoute = this.expandedPath?.filter((p) => !!p.children?.length).slice(-1)[0]; // TODO: Use `at(-1)` with  `es2022` target!

        return (lastRoute?.path ?? '') === (route?.path ?? '');
    }

    close() {
        this.open = false;
        this.openChange.emit(false);
        this.expandedPath = [];
    }

    getLocalizedTitle$(r: PuiMetaRoute) {
        if (this.title) {
            return this.title.getLocalizedTitleForRoute$(r);
        } else {
            return of(r.title);
        }
    }

    /**
     * Traverses the routes tree and returns a list representation of the currently opened nav-panes
     */
    private _traverseAndFlattenRoutes(
        routes: PuiMetaRoutes | undefined,
        state: {
            expandedPath: PuiMetaRoute[];
        },
    ): NavPane[] {
        /** Recursively filters the routes children to remove excluded items,
         * and computes the `pathFromRoot` property for the router link
         **/
        const transformChildRouteRec = (route: PuiMetaRoute, parents: PuiMetaRoute[]): PuiMetaRouteExt => {
            const routes = [...parents, route];
            const children = route.children
                ?.map((child) => transformChildRouteRec(child, routes))
                .filter((child) => !child.data?.sideNav?.excludeFromMenu && (child.title || child.children?.length));
            return {
                ...route,
                pathFromRoot: this._getRouterLinkIfNoChildren(routes, children),
                children,
            };
        };

        const getNavPanesRec = (routes: PuiMetaRoutes | undefined, parents: PuiMetaRoutes): NavPane[] => {
            return routes
                ?.filter(
                    (child) =>
                        !child.data?.sideNav?.excludeFromMenu &&
                        child.children?.length &&
                        child.children.some(
                            (subchild) =>
                                !subchild.data?.sideNav?.excludeFromMenu &&
                                (subchild.title || subchild.children?.length),
                        ) &&
                        (parents.length === 0 || this.isExpanded(child, parents, state.expandedPath)),
                )
                .flatMap((child) => {
                    const children = getNavPanesRec(child.children, [...parents, child]) ?? [];
                    if (!child.title && child.path === '' && children?.length) {
                        // automaticly expand empty path children with no title
                        return children;
                    } else {
                        const transformedRoute = transformChildRouteRec(child, parents);

                        // Only return the new route if it actually has any (non-excluded) children
                        if (transformedRoute.children?.length) {
                            return [
                                {
                                    route: transformedRoute,
                                    parents,
                                    comparableKey: this._routeToComparable(child),
                                },
                                ...children,
                            ];
                        } else {
                            return children;
                        }
                    }
                });
        };

        return routes && routes.length > 0 ? getNavPanesRec([{ children: routes }], []) : [];
    }

    private _getRouterLinkIfNoChildren(routes: PuiMetaRoute[], children: PuiMetaRoute[]) {
        if (!routes?.length) {
            return null;
        }

        const edge = routes.slice(-1)[0];
        if (!children || children.length === 0) {
            return this._getRouterLink(routes);
        } else if (children.length === 1 && children[0].title === edge.title) {
            // Special case, parent route has only one same-titled child, we merge them into one
            return this._getRouterLink([...routes, children[0]]);
        } else {
            return null;
        }
    }

    private _getRouterLink(routes: PuiMetaRoute[]) {
        return routes
            .flatMap((r) => applyUrlParams(r.path, this._getRouteParams())?.split('/') ?? [])
            .filter((p, i) => i === 0 || !!p);
    }

    /**
     * Scrolls to the furthest to the right open nav pane
     *
     * @returns Promise of `true` if successfully scrolled to the nav pane
     */
    private _scrollToOpenedNavPane(): Promise<boolean> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.scrollContainerRef.nativeElement.scrollTo({ top: 0 });
                const navPane = this.sidePaneComponents
                    .toArray()
                    .filter((p) => p.open)
                    .slice(-1)[0];

                if (navPane) {
                    navPane.scrollIntoView();

                    // Also focus the first item in the scrolled-to nav-pane
                    navPane.focusFirstItem();
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 225);
        });
    }

    private _getExpandedPath(): PuiMetaRoute[] {
        if (this.expandedPath?.length) {
            return this.expandedPath;
        } else if (this.initialExpandedRoute) {
            if (typeof this.initialExpandedRoute === 'string') {
                return this._router?.config.filter((r) => r.path.startsWith(this.initialExpandedRoute as string)) ?? [];
            } else if (Array.isArray(this.initialExpandedRoute)) {
                return this._stringPathToRoutes(this.initialExpandedRoute);
            } else if ('path' in this.initialExpandedRoute) {
                return [this.initialExpandedRoute];
            }
        }

        return [];
    }

    private _stringPathToRoutes(path: string[]): PuiMetaRoute[] {
        return path.reduce(
            (current, path, _index) => {
                const match = current.config.find((r) => r.path === path);
                if (match) {
                    if (match.children?.length) {
                        return { config: match.children, path: [...current.path, match] };
                    } else if (path === '') {
                        return { config: current.config, path: [...current.path, match] };
                    } else {
                        return { config: [], path: [...current.path, match] };
                    }
                } else {
                    return current;
                }
            },
            { config: this._router?.config, path: [] },
        ).path;
    }

    /**
     * Route objects might not be the same instance, or even a stripped down information object.
     * This method creates a string version, that can be used for equality comparisions
     */
    private _routeToComparable = (r: PuiMetaRouteExt): string => {
        let obj: unknown = { path: r?.path, title: r?.title, data: r?.data };
        if (this.routeComparableFn) {
            obj = this.routeComparableFn(r);
        }
        return obj ? JSON.stringify(obj) : '';
    };
}

