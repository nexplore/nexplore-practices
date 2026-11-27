import { Injectable, OnDestroy, Optional } from '@angular/core';
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
    private _routerLinkActiveOptionsSubject = new BehaviorSubject<IsActiveMatchOptions>(subsetMatchOptions);
    private _isActiveSubject = new BehaviorSubject<boolean>(null);

    private _routerNavigationEnd$: Observable<NavigationEnd> = this._router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => event as NavigationEnd),
        startWith(null)
    );
    readonly routerLinkActive$ = combineLatest([
        this._routerLinkSubject,
        this._routerLinkActiveOptionsSubject,
        this._isActiveSubject,
        this._routerNavigationEnd$,
    ]).pipe(
        map(
            ([routerLink, routerLinkActiveOptions, isActive]) =>
                isActive ??
                (routerLink != null
                    ? this._router.isActive(this._toUrlTree(routerLink), routerLinkActiveOptions)
                    : false)
        )
    );

    constructor(private _router: Router, @Optional() private _route: ActivatedRoute) {}

    get routerLink$() {
        return this._routerLinkSubject.asObservable();
    }
    get routerLink(): MenuItemRouterLink {
        return this._routerLinkSubject.value;
    }
    setRouterLink(value: MenuItemRouterLink) {
        this._routerLinkSubject.next(value);
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

    /** Resolves the link like Angular's `RouterLink` does, so the active state matches the navigation target. */
    private _toUrlTree(routerLink: Exclude<MenuItemRouterLink, null | undefined>): UrlTree {
        if (routerLink instanceof UrlTree) {
            return routerLink;
        }
        const commands = Array.isArray(routerLink) ? routerLink : [routerLink];
        return this._router.createUrlTree(commands, { relativeTo: this._route });
    }

    ngOnDestroy(): void {
        this._routerLinkSubject.complete();
        this._routerLinkActiveOptionsSubject.complete();
        this._isActiveSubject.complete();
    }
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
