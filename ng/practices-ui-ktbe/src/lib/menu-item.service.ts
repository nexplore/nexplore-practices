import { inject, Injectable, OnDestroy } from '@angular/core';
import { IsActiveMatchOptions, NavigationEnd, Router, RouterLink, UrlTree } from '@angular/router';
import { asapScheduler, BehaviorSubject, combineLatest, debounceTime, filter, map, Observable, startWith } from 'rxjs';

/** Same value types as accepted by Angular's `RouterLink` input. */
export type MenuItemRouterLink = readonly unknown[] | string | UrlTree | null | undefined;

/** Same value types as accepted by Angular's `RouterLinkActive.routerLinkActiveOptions` input. */
export type MenuItemRouterLinkActiveOptions = { exact: boolean } | Partial<IsActiveMatchOptions> | null | undefined;

const subsetMatchOptions: IsActiveMatchOptions = {
    paths: 'subset',
    queryParams: 'subset',
    fragment: 'ignored',
    matrixParams: 'ignored',
};
const exactMatchOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'exact',
    fragment: 'ignored',
    matrixParams: 'ignored',
};

@Injectable()
export class MenuItemService implements OnDestroy {
    private _routerLinkSubject = new BehaviorSubject<MenuItemRouterLink>(null);
    private _navLinkSubject = new BehaviorSubject<MenuItemRouterLink>(null);
    private _routerLinkActiveOptionsSubject = new BehaviorSubject<MenuItemRouterLinkActiveOptions>(null);
    private _navLinkActiveOptionsSubject = new BehaviorSubject<MenuItemRouterLinkActiveOptions>(null);
    private _isActiveSubject = new BehaviorSubject<boolean>(null);

    /** Angular's `RouterLink` on the same element, if any. Its URL is the actual navigation target. */
    private readonly _angularRouterLink = inject(RouterLink, { self: true, optional: true });

    private _routerNavigationEnd$: Observable<NavigationEnd> = this._router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => event as NavigationEnd),
        startWith(null)
    );
    readonly routerLinkActive$ = combineLatest([
        this._routerLinkSubject,
        this._navLinkSubject,
        this._routerLinkActiveOptionsSubject,
        this._navLinkActiveOptionsSubject,
        this._isActiveSubject,
        this._routerNavigationEnd$,
    ]).pipe(
        // Evaluate after the current change detection pass, when the inputs of `RouterLink` are updated as well.
        debounceTime(0, asapScheduler),
        map(([routerLink, navLink, routerLinkActiveOptions, navLinkActiveOptions, isActive]) => {
            if (isActive != null) {
                return isActive;
            }
            const urlTree = this._toUrlTree(navLink, routerLink);
            const options = toMatchOptions(navLinkActiveOptions ?? routerLinkActiveOptions);
            return urlTree ? this._router.isActive(urlTree, options) : false;
        })
    );

    constructor(private _router: Router) {}

    get hasLink(): boolean {
        return !isEmptyLink(this._navLinkSubject.value) || !isEmptyLink(this._routerLinkSubject.value);
    }

    /** Link of the item. When Angular's `RouterLink` is on the same element, its URL is used for the active state. */
    setRouterLink(value: MenuItemRouterLink) {
        this._routerLinkSubject.next(value);
    }

    /** Link used only for the active state. Takes precedence over `routerLink`. */
    setNavLink(value: MenuItemRouterLink) {
        this._navLinkSubject.next(value);
    }

    setRouterLinkActiveOptions(value: MenuItemRouterLinkActiveOptions) {
        this._routerLinkActiveOptionsSubject.next(value);
    }

    /** Takes precedence over the `routerLinkActiveOptions`. */
    setNavLinkActiveOptions(value: MenuItemRouterLinkActiveOptions) {
        this._navLinkActiveOptionsSubject.next(value);
    }

    get isActive$() {
        return this._isActiveSubject.asObservable();
    }
    setIsActive(value: boolean) {
        return this._isActiveSubject.next(value);
    }

    private _toUrlTree(navLink: MenuItemRouterLink, routerLink: MenuItemRouterLink): UrlTree | null {
        if (!isEmptyLink(navLink)) {
            return this._toAbsoluteUrlTree(navLink);
        }
        if (!isEmptyLink(routerLink)) {
            return this._angularRouterLink?.urlTree ?? this._toAbsoluteUrlTree(routerLink);
        }
        return null;
    }

    /** Strings are parsed as absolute URLs and commands are resolved from the root. */
    private _toAbsoluteUrlTree(link: Exclude<MenuItemRouterLink, null | undefined>): UrlTree {
        if (link instanceof UrlTree) {
            return link;
        }
        return Array.isArray(link) ? this._router.createUrlTree(link) : this._router.parseUrl(link as string);
    }

    ngOnDestroy(): void {
        this._routerLinkSubject.complete();
        this._navLinkSubject.complete();
        this._routerLinkActiveOptionsSubject.complete();
        this._navLinkActiveOptionsSubject.complete();
        this._isActiveSubject.complete();
    }
}

/** `''` and `[]` count as no link, so placeholder links do not mark an item as active on every route. */
function isEmptyLink(link: MenuItemRouterLink): link is null | undefined | '' | readonly [] {
    return link == null || link === '' || (Array.isArray(link) && link.length === 0);
}

function toMatchOptions(options: MenuItemRouterLinkActiveOptions): IsActiveMatchOptions {
    if (!options) {
        return subsetMatchOptions;
    }
    if ('exact' in options) {
        return options.exact ? exactMatchOptions : subsetMatchOptions;
    }
    const definedOptions = Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined));
    return { ...subsetMatchOptions, ...definedOptions };
}
