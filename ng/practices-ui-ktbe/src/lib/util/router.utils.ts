import { Router, ActivatedRouteSnapshot, Params } from '@angular/router';

import { compareUrlWithWildcards, trimChars } from '../util/utils';
import { PuibeMetaRoute } from '../side-navigation/side-navigation.interface';

export function getActivatedRouteSnapshotJoinedPath(snapshot: ActivatedRouteSnapshot): string {
    return snapshot.url.map((s) => s.path).join('/');
}

export function getActivatedRouteSnapshotRouterTreeUrl(router: Router, snapshot: ActivatedRouteSnapshot): string {
    const snapshotPath = snapshot.root === snapshot ? [snapshot] : snapshot.pathFromRoot;
    const urlPath = snapshotPath.flatMap((p2) => p2.url.map((s) => s.path));
    const url = router.createUrlTree(urlPath.length === 0 ? ['/'] : urlPath).toString();
    return url;
}

export function applyUrlParams(url: string, params: Params) {
    if (!url) {
        return url;
    }

    Object.entries(params).forEach(([key, val]) => {
        url = url.replace(`:${key}`, val);
    });
    return url;
}

export function normalizeUrlForComparision(str: string, baseUrl?: string, paramMap?: Params) {
    if (str === null || str === undefined) {
        return str;
    }

    if (str === '/') {
        return '/';
    }

    if (str === '') {
        return '/';
    }

    if (paramMap && str.includes(':')) {
        str = applyUrlParams(str, paramMap);
    }

    if (baseUrl && baseUrl.startsWith('http')) {
        if (str.startsWith('./#')) {
            str = str.slice(3);
        } else if (str.startsWith('#/')) {
            str = str.slice(2);
        } else if (str.startsWith('#')) {
            str = str.slice(1);
        } else if (str.startsWith('./')) {
            str = str.slice(2);
        } else if (str.startsWith('.')) {
            str = str.slice(1);
        }
    }

    if (baseUrl && !baseUrl.includes('#') && !str.includes('#')) {
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }

        baseUrl += '#/';
    }

    if (baseUrl && !str.startsWith('http') && !str.startsWith(baseUrl) && !str.startsWith('*')) {
        if (baseUrl.endsWith('/') && str.startsWith('/')) {
            str = str.slice(1);
        }

        str = baseUrl + str;
    } else if (baseUrl === '') {
        if (str.startsWith('/')) {
            str = str.slice(1);
        }
    }

    if (!str.endsWith('/')) {
        str += '/';
    }

    return str.toLowerCase();
}

export function routerLinkToString(routerLink?: string | string[]) {
    if (routerLink instanceof Array) {
        return routerLink.join('/').replace(/\/{2,5}/g, '/');
    } else {
        return routerLink;
    }
}

export function getUrlForRoutes(routes: (PuibeMetaRoute | PuibeMetaRouteMatch)[]): string {
    function getPath(r: PuibeMetaRoute<unknown> | PuibeMetaRouteMatch): string {
        return (r as PuibeMetaRouteMatch).pathWithAppliedParams ?? r.path;
    }

    const path = routerLinkToString(routes.map(getPath));

    if (path.length <= 1) {
        return path;
    } else {
        return trimChars(path, '/', { end: true });
    }
}

export function getHrefRelativePath(href: string | null, options?: { includeQuery?: boolean }) {
    if (!href) {
        return href;
    }

    if (href.includes('#')) {
        href = href?.split('#')[1];
    } else if (href.startsWith('http')) {
        href = new URL(href).pathname;
    }

    if (!options?.includeQuery) {
        href = href?.split('?')[0];
    }

    return href || '/';
}

export function getWindowHrefRelativePath() {
    return getHrefRelativePath(window.location.href);
}

export type PuibeMetaRouteMatch = PuibeMetaRoute & {
    pathWithAppliedParams?: string;
    appliedParams?: Params;
    aliasMatch?: string | RegExp;
    isExactMatch?: boolean;
    pathFromRoot?: string;
};

/** Replaces :placeholders in url with the supplied params */
export function applyParamsToUrl(url: string, params: Params): string {
    if (!url || !params) {
        return url;
    }

    return Object.entries(params).reduce(
        (redirectTo, [key, val]) => redirectTo.replace(key.startsWith(':') ? key : `:${key}`, val),
        url
    );
}

/** Replaces :params in relative url paths with actual values */
export function applyParameterizedUrlSegmentToPathTemplate({
    pathTemplate,
    urlWithParams,
    routePath,
    aliasUrlTemplate,
}: {
    pathTemplate: string;
    urlWithParams: string;
    routePath?: PuibeMetaRouteMatch[];
    aliasUrlTemplate?: string | RegExp;
}): { pathWithAppliedParams: string; appliedParams: Params | null } {
    if (!pathTemplate || !pathTemplate.includes(':')) {
        return { pathWithAppliedParams: pathTemplate, appliedParams: null };
    }

    const urlSegments = urlWithParams.split('/');
    const segmentStartsWithSlash = urlWithParams.startsWith('/');
    const aliasMatchSegments =
        typeof aliasUrlTemplate === 'string' &&
        (segmentStartsWithSlash
            ? aliasUrlTemplate
            : trimChars(aliasUrlTemplate as string, '/', { start: true })
        )?.split('/');

    const templateSegments = pathTemplate.split('/');
    if (!aliasMatchSegments && templateSegments.length > urlSegments.length) {
        return { pathWithAppliedParams: pathTemplate, appliedParams: null };
    } else {
        const paramMap: Params = {};
        const routePathSegments = routePath?.flatMap((r) => r.path?.split('/')) ?? [];
        const fullTemplateSegments = [...routePathSegments, ...templateSegments];
        const replacedPath = fullTemplateSegments
            .map((t, i) => {
                if (t.startsWith(':')) {
                    // If there is only one segment, then we can safely replace
                    let segmentIndex = templateSegments.length === 1 && urlSegments.length === 1 ? i : null;

                    // Check for alias url and find the :param index there
                    if (typeof aliasUrlTemplate === 'string' && aliasMatchSegments.length <= urlSegments.length) {
                        const aliasMatchIndex = aliasMatchSegments.indexOf(t);
                        if (aliasMatchIndex !== -1) {
                            segmentIndex = aliasMatchIndex;
                        }
                    }

                    // Make sure preceding path segment matches. otherwise we can't be sure
                    if (segmentIndex === null && i > 0) {
                        const precedingMatchIndex = urlSegments.indexOf(fullTemplateSegments[i - 1]);
                        if (precedingMatchIndex !== -1 && urlSegments[precedingMatchIndex + 1] !== undefined) {
                            segmentIndex = precedingMatchIndex + 1;
                        }
                    }

                    if (segmentIndex !== null) {
                        const segmentValue = urlSegments[segmentIndex];
                        if (segmentValue) {
                            paramMap[t] = segmentValue;

                            // Update the template segment with the actual value, so the next comparision can work with consecutive values
                            fullTemplateSegments[fullTemplateSegments.indexOf(t)] = segmentValue;
                        }
                        return segmentValue ?? t;
                    }
                }

                return t;
            })
            .slice(routePathSegments?.length ?? 0)
            .join('/');

        return { pathWithAppliedParams: replacedPath, appliedParams: paramMap };
    }
}

export function getRoutesForUrl(
    url: string,
    routeConfig: PuibeMetaRoute[],
    options?: { fullMatch?: boolean; baseUrl?: string; includeHomeSlashRoute?: boolean }
): PuibeMetaRouteMatch[] {
    url = url.split('?')[0];
    const normalizedUrl = normalizeUrlForComparision(url, options?.baseUrl);

    function getAliasUrlMatch(route: PuibeMetaRoute<unknown>): string | RegExp {
        const aliasUrls = [getHrefRelativePath(route?.data?.link?.href), ...(route?.data?.subChildrenAliasUrls ?? [])];

        return aliasUrls
            .filter(Boolean)
            .find((linkAlias) =>
                compareUrlWithWildcards(
                    normalizedUrl,
                    linkAlias instanceof RegExp ? linkAlias : normalizeUrlForComparision(linkAlias, options?.baseUrl)
                )
            );
    }

    function isSubSegmentMatch(segment: string, routePath: string): boolean {
        return (
            segment?.includes(normalizeUrlForComparision(routePath, '')) &&
            '/' === segment.substring(routePath.length, routePath.length + 1)
        );
    }

    function isRouteDataLinkMatch(route: PuibeMetaRoute<unknown>, url: string): boolean {
        if (!route.data?.link?.href) {
            return false;
        }

        if (route.data.link.href.startsWith('http')) {
            return compareUrlWithWildcards(
                normalizeUrlForComparision(url, options?.baseUrl),
                normalizeUrlForComparision(route.data?.link?.href, options?.baseUrl)
            );
        } else {
            return compareUrlWithWildcards(
                normalizeUrlForComparision(getHrefRelativePath(url), options?.baseUrl),
                normalizeUrlForComparision(getHrefRelativePath(route.data?.link?.href), options?.baseUrl)
            );
        }
    }

    function isAppliedParamsConsecutiveDuplicate(
        appliedParams: { pathWithAppliedParams: string; appliedParams: Params },
        route: PuibeMetaRoute<unknown>,
        routePath: PuibeMetaRouteMatch[]
    ): boolean {
        if (appliedParams.pathWithAppliedParams === route.path) {
            return false;
        }

        if (
            routePath
                ?.map((r) => r?.pathWithAppliedParams)
                .filter(Boolean)
                .slice(-1)
                .includes(appliedParams.pathWithAppliedParams)
        ) {
            return true;
        }

        if (
            routePath
                ?.map((r) => normalizeUrlForComparision(getHrefRelativePath(r?.data?.link?.href), ''))
                .filter(Boolean)
                .slice(-1)
                .includes(normalizeUrlForComparision(appliedParams.pathWithAppliedParams, ''))
        ) {
            return true;
        }

        return false;
    }

    function applyRouteMatch(
        route: PuibeMetaRoute<unknown>,
        url: string,
        currentSegment: string,
        routePath?: PuibeMetaRouteMatch[]
    ) {
        const aliasMatch = getAliasUrlMatch(route);
        const appliedParams = applyParameterizedUrlSegmentToPathTemplate({
            urlWithParams: url,
            pathTemplate: route.path,
            routePath,
            aliasUrlTemplate: aliasMatch,
        });

        // Check if some params could not be replaced, or if there are duplicate consecutive paths that were mis-generated by wrong param replacements
        if (
            appliedParams.pathWithAppliedParams.includes(':') ||
            isAppliedParamsConsecutiveDuplicate(appliedParams, route, routePath)
        ) {
            return { ...route, isExactMatch: false, aliasMatch: null };
        }

        const isRouteFullPathMatch = route.pathMatch === 'full';
        const isExactMatch =
            !route.path || // Path is empty, it could have children with exact match
            isRouteDataLinkMatch(route, url) || // Compare data.link.href
            compareUrlWithWildcards(currentSegment, normalizeUrlForComparision(route.path, '')) ||
            compareUrlWithWildcards(
                currentSegment,
                normalizeUrlForComparision(appliedParams.pathWithAppliedParams, '')
            ) ||
            (isSubSegmentMatch(currentSegment, route.path) && !isRouteFullPathMatch) || // Is the route path included inside the current segment (and the route allows partial non 'full' matches)
            (isSubSegmentMatch(currentSegment, appliedParams.pathWithAppliedParams) && !isRouteFullPathMatch);

        const mappedResult = {
            ...route,
            ...appliedParams,
            aliasMatch,
            isExactMatch,
        };

        return mappedResult;
    }

    function getRouteMatchScore(route: PuibeMetaRouteMatch | null): number {
        if (!route) {
            return 0;
        }

        if (route.isExactMatch && route.path === '') {
            return 1;
        } else if (route.isExactMatch) {
            const bonusForExact = 100;
            return bonusForExact + route.path?.length;
        } else {
            return route.path?.length ?? -1;
        }
    }

    function findBestMatchingRoute(
        routes: PuibeMetaRoute[],
        params: { url: string; currentSegment?: string; exactMatch?: boolean; routePath?: PuibeMetaRoute[] }
    ) {
        params.currentSegment = params.currentSegment ?? normalizeUrlForComparision(params.url, '');

        return routes
            .map((route) => applyRouteMatch(route, params.url, params.currentSegment, params.routePath))
            .filter((routeMatch) => routeMatch.isExactMatch || (!params.exactMatch && !!routeMatch.aliasMatch))
            .reduce((bestRouteMatch, routeMatch) => {
                const routeScore = getRouteMatchScore(routeMatch);
                const bestRouteScore = getRouteMatchScore(bestRouteMatch);
                if (routeScore > bestRouteScore) {
                    return routeMatch;
                } else {
                    return bestRouteMatch;
                }
            }, null);
    }

    function findBestRouteAmongstMatches(allRoutes: PuibeMetaRouteMatch[][]) {
        return allRoutes.reduce<{ longestRoutePath: PuibeMetaRouteMatch[]; longestRouteScore: number }>(
            (previousMatch, routePath) => {
                const { longestRouteScore } = previousMatch;
                const routeScore = routePath.reduce((score, route) => {
                    const routeScore = getRouteMatchScore(route);
                    return score + routeScore;
                }, 0);

                if (routeScore > longestRouteScore) {
                    (routePath as any)._score = routeScore;
                    return { longestRoutePath: routePath, longestRouteScore: routeScore };
                } else {
                    return previousMatch;
                }
            },
            { longestRoutePath: [], longestRouteScore: 0 }
        ).longestRoutePath;
    }

    function getAllMatchingRoutes(
        routes: PuibeMetaRoute[],
        params: { url: string; currentSegment?: string; exactMatch?: boolean; routePath?: PuibeMetaRoute[] }
    ) {
        params.currentSegment = params.currentSegment ?? normalizeUrlForComparision(params.url, '');

        return routes
            .map((route) => applyRouteMatch(route, params.url, params.currentSegment, params.routePath))
            .filter((r) => r.isExactMatch || (!params.exactMatch && !!r.aliasMatch));
    }

    const recurse = (
        url: string,
        parentRoute: PuibeMetaRoute,
        routePath: PuibeMetaRouteMatch[],
        currentSegment?: string
    ): PuibeMetaRouteMatch[][] => {
        currentSegment = normalizeUrlForComparision(currentSegment ?? url, '');
        const routes: PuibeMetaRouteMatch[] = getAllMatchingRoutes(
            parentRoute.children ?? (parentRoute as any)._loadedRoutes,
            {
                url,
                currentSegment,
                routePath,
            }
        );
        if (!routes.length) {
            return [routePath];
        }

        return routes.flatMap((route) => {
            const newRoutes = [...routePath, route];
            route.pathFromRoot = getUrlForRoutes(newRoutes) || '/';
            if (!route.pathFromRoot.startsWith('/')) {
                route.pathFromRoot = '/' + route.pathFromRoot;
            }

            if (!route.children?.length && !(route as any)._loadedRoutes?.length) {
                return [newRoutes];
            } else if (route.isExactMatch) {
                return recurse(
                    url,
                    route,
                    newRoutes,
                    route.path
                        ? currentSegment.substring((route.pathWithAppliedParams || route.path).length + 1)
                        : currentSegment
                );
            } else {
                return recurse(url, route, newRoutes, currentSegment);
            }
        });
    };

    const startsWithSlash = url !== '/' && url.startsWith('/');
    if (startsWithSlash) {
        url = url.substring(1);
    }

    const allMatchingRoutes = recurse(url, { children: routeConfig }, []);
    let path = findBestRouteAmongstMatches(allMatchingRoutes);
    if (startsWithSlash && options?.includeHomeSlashRoute) {
        const homePath = findBestMatchingRoute(routeConfig, { url: '/', exactMatch: true });
        if (homePath) {
            path = [homePath, ...path];
        }
    }

    const lastSegment = path.slice(-1)[0];

    if (
        options?.fullMatch &&
        !normalizeUrlForComparision(url, '').endsWith(
            normalizeUrlForComparision(lastSegment?.pathWithAppliedParams ?? lastSegment?.path, '')
        ) &&
        !compareUrlWithWildcards(
            normalizedUrl,
            normalizeUrlForComparision(lastSegment?.data?.link?.href, options?.baseUrl)
        )
    ) {
        return [];
    }

    if (lastSegment) {
        const allAppliedParams = path.reduce<Params>(
            (p, r) => (r.appliedParams ? { ...p, ...r.appliedParams } : p),
            null
        );

        // Add metadata that allows a consument to apply the effective named route parameters
        lastSegment.appliedParams = allAppliedParams;

        path = path.map((segment) => {
            return {
                ...segment,
                // Apply params to redirect urls
                redirectTo:
                    segment.redirectTo && typeof segment.redirectTo === 'string'
                        ? applyParamsToUrl(segment.redirectTo, allAppliedParams)
                        : segment.redirectTo,
                data: {
                    ...segment.data,
                    link: segment.data?.link
                        ? {
                              ...segment.data.link,
                              href: segment.data.link.href
                                  ? applyParamsToUrl(segment.data.link.href, allAppliedParams)
                                  : segment.data.link.href,
                          }
                        : null,
                },
            };
        });
    }

    return path;
}

export function collectRouteParams(root: ActivatedRouteSnapshot): Params {
    let params = {};
    const stack: ActivatedRouteSnapshot[] = [root];
    while (stack.length > 0) {
        const route = stack.pop()!;
        params = { ...params, ...route.params };
        stack.push(...route.children);
    }
    return params;
}
