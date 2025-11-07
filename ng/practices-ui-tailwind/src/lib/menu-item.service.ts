import { inject, Injectable, OnDestroy } from '@angular/core';
import { IsActiveMatchOptions, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map, Observable, startWith } from 'rxjs';

@Injectable()
export class MenuItemService implements OnDestroy {
    private _router = inject(Router);

    private _routerLinkSubject = new BehaviorSubject<string | null>(null);
    private _routerLinkActiveOptionsSubject = new BehaviorSubject<IsActiveMatchOptions>({
        paths: 'subset',
        queryParams: 'subset',
        fragment: 'ignored',
        matrixParams: 'ignored',
    });
    private _isActiveSubject = new BehaviorSubject<boolean | null>(null);

    private _routerNavigationEnd$: Observable<NavigationEnd | null> = this._router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(null),
    );
    readonly routerLinkActive$ = combineLatest([
        this._routerLinkSubject,
        this._routerLinkActiveOptionsSubject,
        this._isActiveSubject,
        this._routerNavigationEnd$,
    ]).pipe(
        map(
            ([routerLink, routerLinkActiveOptions, isActive]) =>
                isActive ?? (routerLink ? this._router.isActive(routerLink, routerLinkActiveOptions) : false),
        ),
    );

    get routerLink$() {
        return this._routerLinkSubject.asObservable();
    }
    setRouterLink(value: string | null) {
        this._routerLinkSubject.next(value);
    }

    get routerLinkActiveOptions$() {
        return this._routerLinkActiveOptionsSubject.asObservable();
    }
    setRouterLinkActiveOptions(value: IsActiveMatchOptions) {
        this._routerLinkActiveOptionsSubject.next(value);
    }

    get isActive$() {
        return this._isActiveSubject.asObservable();
    }
    setIsActive(value: boolean | null) {
        return this._isActiveSubject.next(value);
    }

    ngOnDestroy(): void {
        this._routerLinkSubject.complete();
        this._routerLinkActiveOptionsSubject.complete();
        this._isActiveSubject.complete();
    }
}

