import { inject, Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, IsActiveMatchOptions, NavigationEnd, Router, UrlTree } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, startWith } from 'rxjs';

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
    private _routerLinkActiveOptionsSubject = new BehaviorSubject<IsActiveMatchOptions>(subsetMatchOptions);
    private _isActiveSubject = new BehaviorSubject<boolean>(null);

    private _routerNavigationEnd$: Observable<NavigationEnd> = this._router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => event as NavigationEnd),
        startWith(null)
    );
    readonly routerLinkActive$ = combineLatest([
        this._routerLinkSubject,
        this._navLinkSubject,
        this._routerLinkActiveOptionsSubject,
        this._isActiveSubject,
        this._routerNavigationEnd$,
    ]).pipe(
        map(([, , routerLinkActiveOptions, isActive]) => {
            if (isActive != null) {
                return isActive;
            }
            const urlTree = this._toUrlTree();
            return urlTree ? this._router.isActive(urlTree, routerLinkActiveOptions) : false;
        })
    );

    private readonly _route = inject(ActivatedRoute, { optional: true });

    constructor(private _router: Router) {}

    get hasLink(): boolean {
        return !isEmptyLink(this._navLinkSubject.value) || !isEmptyLink(this._routerLinkSubject.value);
    }

    /** Link of the `RouterLink` on the same element. Resolved like `RouterLink` does: relative to the item's route. */
    setRouterLink(value: MenuItemRouterLink) {
        this._routerLinkSubject.next(value);
    }

    /** Link used only for the active state. Takes precedence over `routerLink`; strings are parsed as absolute URLs. */
    setNavLink(value: MenuItemRouterLink) {
        this._navLinkSubject.next(value);
    }

    get routerLinkActiveOptions$() {
        return this._routerLinkActiveOptionsSubject.asObservable();
    }
    setRouterLinkActiveOptions(value: MenuItemRouterLinkActiveOptions) {
        this._routerLinkActiveOptionsSubject.next(toMatchOptions(value));
    }

    get isActive$() {
        return this._isActiveSubject.asObservable();
    }
    setIsActive(value: boolean) {
        return this._isActiveSubject.next(value);
    }

    private _toUrlTree(): UrlTree | null {
        const navLink = this._navLinkSubject.value;
        if (!isEmptyLink(navLink)) {
            if (navLink instanceof UrlTree) {
                return navLink;
            }
            return Array.isArray(navLink)
                ? this._router.createUrlTree(navLink)
                : this._router.parseUrl(navLink as string);
        }

        const routerLink = this._routerLinkSubject.value;
        if (!isEmptyLink(routerLink)) {
            if (routerLink instanceof UrlTree) {
                return routerLink;
            }
            const commands = Array.isArray(routerLink) ? routerLink : [routerLink];
            return this._router.createUrlTree(commands, { relativeTo: this._route });
        }

        return null;
    }

    ngOnDestroy(): void {
        this._routerLinkSubject.complete();
        this._navLinkSubject.complete();
        this._routerLinkActiveOptionsSubject.complete();
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
    return { ...subsetMatchOptions, ...options };
}
