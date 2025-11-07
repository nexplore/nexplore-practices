import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    inject,
    Input,
    OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DestroyService, TitleService } from '@nexplore/practices-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EMPTY, filter, map, of, startWith, takeUntil } from 'rxjs';
import { RouterUtilService } from '../router-util.service';
import { PuiMetaRoute, PuiMetaRoutes } from '../side-navigation/side-navigation.interface';
import { getHrefRelativePath, getWindowHrefRelativePath, PuiMetaRouteMatch } from '../util/router.utils';
import { compareUrlWithWildcards, trimChars } from '../util/utils';
import { PuiBreadcrumbItemComponent } from './item/breadcrumb-item.component';

@Component({
    standalone: true,
    selector: 'pui-breadcrumb',
    templateUrl: './breadcrumb.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, TranslateModule, PuiBreadcrumbItemComponent],
    providers: [DestroyService],
})
export class PuiBreadcrumbComponent implements OnInit {
    private router = inject(Router, { optional: true });
    private activatedRoute = inject(ActivatedRoute, { optional: true });
    readonly titleService = inject(TitleService, { optional: true });
    readonly translate = inject(TranslateService, { optional: true });
    private _cdr = inject(ChangeDetectorRef);
    private _destroy$ = inject(DestroyService);
    private routerUtilService = inject(RouterUtilService);

    @HostBinding('role')
    readonly role = 'navigation';

    @HostBinding('aria-label')
    readonly ariaLabel = this.translate?.instant('Practices.Labels_Navigation_Breadcrumbs') ?? 'Breadcrumbs';

    @Input()
    useRouterConfig?: boolean | PuiMetaRoutes;

    @Input()
    alwaysShowHome?: boolean;

    @Input()
    hideCurrentlyActiveItem?: boolean;

    /* @internal For debugging and diagnostics only */
    data?: unknown;

    get routerConfig() {
        if (typeof this.useRouterConfig === 'object') {
            return this.useRouterConfig;
        } else {
            return null;
        }
    }

    // Returns the current Route[] path
    routePath$ = this.router?.events
        ? this.router.events.pipe(
              filter((ev): ev is NavigationEnd => ev instanceof NavigationEnd),
              startWith(undefined as unknown as NavigationEnd),
              map((_ev) => this.getRoutePath()),
              filter((routes) => !!routes.length),
          )
        : EMPTY;

    ngOnInit(): void {
        this.titleService?.breadcrumbTitles$.pipe(takeUntil(this._destroy$)).subscribe(() => this._cdr.markForCheck());
    }

    private getRoutePath() {
        const routerUrl = '/' + trimChars(this.router?.url ?? '', '/');

        const rootSnapshot = this.activatedRoute?.snapshot.root as unknown;
        const routesForCurrentUrl = this.routerUtilService.getSegmentsForActivatedRouteSnapshot(
            rootSnapshot as unknown as import('@angular/router').ActivatedRouteSnapshot,
            this.routerConfig ?? undefined,
        );

        // Filter out empty titles and duplicates
        const filteredRoutes = (routesForCurrentUrl as PuiMetaRouteMatch[])
            .filter((r) => !r.data?.breadcrumb?.excludeFromBreadcrumb)
            .reduce(
                (arr: PuiMetaRouteMatch[], r) => [
                    ...arr,
                    // Filter out duplicates
                    ...(!arr.some(
                        (r2) =>
                            this.getRouteTitleKey(r2) === this.getRouteTitleKey(r) &&
                            (r2.pathFromRoot === r.pathFromRoot ||
                                (!!r?.data?.link?.href && r2.data?.link?.href === r.data?.link?.href)),
                    )
                        ? [r]
                        : []),
                ],
                [] as PuiMetaRouteMatch[],
            )
            .map((r) => ({
                ...r,
                active: this.isActiveRoute(r),
            }));

        // Set data property for debugging/diagnostic purposes
        this.data = {
            routesForCurrentUrl,
            routerUrl,
            filteredRoutes,
        };

        return filteredRoutes;
    }

    getLocalizedTitle$(r: PuiMetaRouteMatch) {
        const title = r.data?.breadcrumb?.title ?? (r.title as string);
        if (this.titleService) {
            // Add the search query to the path
            const query = location.search;
            const relativeUrl = r.pathFromRoot + query;

            // TODO: There is an edge case, if both a parent route and a child route have their own url-params, the breadcrumb title may no longer be found for the parent.
            const fallbackAliasUrls = [
                r.pathFromRoot, // Fallback 1: Search for url without query params
                getHrefRelativePath(r.data?.link?.href, { includeQuery: true }), // Fallback 2: Search for redirect link
            ].filter(Boolean);

            return this.titleService.getLocalizedBreadcrumbTitleForRoute$(relativeUrl, title, {
                fallbackAliasUrls,
            });
        } else {
            return of(title);
        }
    }

    isActiveRoute(route: PuiMetaRouteMatch) {
        const url = route.pathFromRoot;
        const currentHrefPath = getWindowHrefRelativePath();

        if (currentHrefPath === url) {
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

    private getRouteTitleKey(r: PuiMetaRoute) {
        const data: unknown = (r as unknown as { data?: unknown }).data;
        if (data && typeof data === 'object' && 'breadcrumb' in data) {
            const breadcrumb = (data as { breadcrumb?: { title?: string } }).breadcrumb;
            return breadcrumb?.title ?? (r.title as string);
        }
        return r.title as string;
    }
}

