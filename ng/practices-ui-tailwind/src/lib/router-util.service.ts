import { LocationStrategy } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Params, Router, Routes } from '@angular/router';
import { PuiMetaRoute } from './side-navigation/side-navigation.interface';
import {
    collectRouteParams,
    getActivatedRouteSnapshotRouterTreeUrl,
    getRoutesForUrl,
    getUrlForRoutes,
    normalizeUrlForComparision,
} from './util/router.utils';
import { trimChars } from './util/utils';

@Injectable({ providedIn: 'root' })
export class RouterUtilService {
    private router = inject(Router);
    private locationStrategy = inject(LocationStrategy);


    /** Returns a list of route segments for the given url */
    getRoutesForUrl(
        url: string,
        routeConfig?: Routes,
        options?: { fullMatch?: boolean; includeHomeSlashRoute?: boolean },
    ) {
        const res = getRoutesForUrl(url, routeConfig ?? this.router.config, {
            ...options,
            baseUrl: this.getBaseUrl(),
        });

        return res;
    }

    getUrlForRoutePath(routes: PuiMetaRoute[]) {
        return getUrlForRoutes(routes);
    }

    /**
     * Gets the route segments for the given snapshot
     *
     * @param root The route snapshot root
     * @param fallbackRouterConfig Allows to pass a custom routerConfig as a fallback, in case no routes are found
     * @returns A list for each route segment in the given url
     */
    getSegmentsForActivatedRouteSnapshot(
        root: ActivatedRouteSnapshot,
        fallbackRouterConfig?: Routes,
    ): (PuiMetaRoute & { pathFromRoot?: string })[] {
        const getRoutesRec = (
            root: ActivatedRouteSnapshot,
            depth: number,
        ): (PuiMetaRoute & { pathFromRoot: string })[] => {
            const current = {
                ...root.routeConfig,
                pathFromRoot: getActivatedRouteSnapshotRouterTreeUrl(this.router, root),
            };

            const childPath = root?.firstChild ? getRoutesRec(root.firstChild, 1 + (depth ?? 0)) : [];

            return [
                current,
                ...childPath.filter(
                    (p) => trimChars(p.pathFromRoot, '/') !== trimChars(current.pathFromRoot, '/') && !!p.title,
                ),
            ];
        };

        const routes = getRoutesRec(root, 0);
        const lastRoute = routes.slice(-1)[0];
        if (fallbackRouterConfig && lastRoute?.pathFromRoot !== this.router.url) {
            return this.getRoutesForUrl(this.router.url, fallbackRouterConfig, { includeHomeSlashRoute: true });
        } else {
            return routes;
        }
    }

    normalizeUrlForComparision(str: string, paramMap?: Params): string {
        return normalizeUrlForComparision(str, this.getBaseUrl(), paramMap ?? this.getRouteParams());
    }

    getBaseUrl(): string {
        let baseHref = this.locationStrategy.prepareExternalUrl(this.locationStrategy.getBaseHref() || '/');
        if (baseHref.startsWith('/') === false) {
            baseHref = '/' + baseHref;
        }

        return window.location.origin + baseHref;
    }

    private getRouteParams(): Params {
        return collectRouteParams(this.router.routerState.snapshot.root);
    }
}

