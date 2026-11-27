import { inject, Injectable, OnDestroy } from '@angular/core';
import { isActive, IsActiveMatchOptions, NavigationEnd, Router, RouterLink, UrlTree } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, startWith, Subject } from 'rxjs';

/** Same value types as accepted by Angular's `RouterLink` input. */
export type MenuItemRouterLink = readonly unknown[] | string | UrlTree | null | undefined;

/**
 * Same shapes as accepted by Angular's `RouterLinkActive.routerLinkActiveOptions` input. Unlike `RouterLinkActive`,
 * `null` and `undefined` both mean the default subset matching, as they did before.
 */
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
    private _routerLink: MenuItemRouterLink = null;
    private _routerLinkChangeSubject = new Subject<void>();
    private _angularRouterLinkState: readonly unknown[] = [];
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
        this._navLinkSubject,
        this._routerLinkActiveOptionsSubject,
        this._navLinkActiveOptionsSubject,
        this._isActiveSubject,
        this._routerNavigationEnd$,
        // With `RouterLink`, the first evaluation comes from the first `ngDoCheck`, right after `ngOnInit`.
        this._angularRouterLink
            ? this._routerLinkChangeSubject
            : this._routerLinkChangeSubject.pipe(startWith(undefined)),
    ]).pipe(
        map(([navLink, routerLinkActiveOptions, navLinkActiveOptions, isActiveInput]) => {
            if (isActiveInput != null) {
                return isActiveInput;
            }
            const urlTree = this._toUrlTree(navLink);
            const options = toMatchOptions(navLinkActiveOptions ?? routerLinkActiveOptions);
            return urlTree ? isActive(urlTree, this._router, options)() : false;
        })
    );

    constructor(private _router: Router) {}

    /** Whether the item is a link, for styling. With `RouterLink`, even an empty link navigates. */
    get hasLink(): boolean {
        const routerLink = this._routerLink;
        const hasRouterLink = this._angularRouterLink ? routerLink != null : !isEmptyLink(routerLink);
        return !isEmptyLink(this._navLinkSubject.value) || hasRouterLink;
    }

    /**
     * Link of the item. When Angular's `RouterLink` is on the same element, its URL (the actual navigation target) is
     * used for the active state. Otherwise the link is handled like a `navLink`. `''` and `[]` count as no link.
     */
    setRouterLink(value: MenuItemRouterLink) {
        this._routerLink = value;
        if (!this._angularRouterLink) {
            this._routerLinkChangeSubject.next();
        }
        // With `RouterLink`, `checkAngularRouterLink` re-evaluates once the `RouterLink` inputs are updated as well.
    }

    /**
     * Link used only for the active state. Takes precedence over `routerLink`. Strings are parsed as absolute URLs,
     * `''` and `[]` count as no link.
     */
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

    /**
     * Re-evaluates the active state when the inputs of Angular's `RouterLink` changed. To be called from `ngDoCheck`,
     * which runs after all inputs of the element are set, as `RouterLink` does not expose changes of its inputs.
     */
    checkAngularRouterLink() {
        const routerLink = this._angularRouterLink;
        if (!routerLink) {
            return;
        }
        const state = [
            this._routerLink,
            routerLink.queryParams,
            routerLink.fragment,
            routerLink.queryParamsHandling,
            routerLink.preserveFragment,
            routerLink.relativeTo,
        ];
        if (state.some((value, index) => value !== this._angularRouterLinkState[index])) {
            this._angularRouterLinkState = state;
            this._routerLinkChangeSubject.next();
        }
    }

    get isActive$() {
        return this._isActiveSubject.asObservable();
    }
    setIsActive(value: boolean) {
        return this._isActiveSubject.next(value);
    }

    private _toUrlTree(navLink: MenuItemRouterLink): UrlTree | null {
        if (!isEmptyLink(navLink)) {
            return this._toAbsoluteUrlTree(navLink);
        }
        if (isEmptyLink(this._routerLink)) {
            return null;
        }
        return this._angularRouterLink?.urlTree ?? this._toAbsoluteUrlTree(this._routerLink);
    }

    /** Strings are parsed as absolute URLs and commands are resolved from the root. */
    private _toAbsoluteUrlTree(link: Exclude<MenuItemRouterLink, null | undefined>): UrlTree {
        if (link instanceof UrlTree) {
            return link;
        }
        return Array.isArray(link) ? this._router.createUrlTree(link) : this._router.parseUrl(link as string);
    }

    ngOnDestroy(): void {
        this._navLinkSubject.complete();
        this._routerLinkActiveOptionsSubject.complete();
        this._navLinkActiveOptionsSubject.complete();
        this._isActiveSubject.complete();
        this._routerLinkChangeSubject.complete();
    }
}

/** `''` and `[]` count as no link, so placeholder links do not mark an item as active on every route. */
function isEmptyLink(link: MenuItemRouterLink): link is null | undefined | '' | readonly [] {
    return link == null || link === '' || (Array.isArray(link) && link.length === 0);
}

/** Interprets set options like Angular's `RouterLinkActive` does; `null` and `undefined` mean subset matching. */
function toMatchOptions(options: MenuItemRouterLinkActiveOptions): IsActiveMatchOptions {
    if (!options) {
        return subsetMatchOptions;
    }
    const matchOptions = options as Partial<IsActiveMatchOptions>;
    if (matchOptions.paths || matchOptions.matrixParams || matchOptions.queryParams || matchOptions.fragment) {
        const definedOptions = Object.fromEntries(
            Object.entries(matchOptions).filter(([, value]) => value !== undefined)
        );
        return { ...subsetMatchOptions, ...definedOptions };
    }
    return (options as { exact?: boolean }).exact ? exactMatchOptions : subsetMatchOptions;
}
