import { Injector } from '@angular/core';
import {
    GuardsCheckStart,
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    ResolveStart,
    Router,
} from '@angular/router';
import { StatusService, TitleService } from '@nexplore/practices-ui';
import { RouterUtilService } from '@nexplore/practices-ui-ktbe';
import { first, map, mergeMap, of, takeUntil, throwError, timer } from 'rxjs';

/**
 * Registers status messages for navigation event
 */
export function registerStatusForNavigation(ev: NavigationStart, injector: Injector): void {
    const router = injector.get(Router);
    const routerUtil = injector.get(RouterUtilService);
    const statusService = injector.get(StatusService);
    const titleService = injector.get(TitleService);

    const end = router.events.pipe(
        first(
            (ev2) =>
                (ev2 instanceof NavigationEnd || ev2 instanceof NavigationError || ev2 instanceof NavigationCancel) &&
                ev2.id === ev.id
        ),
        mergeMap((ev) => (ev instanceof NavigationError ? throwError(() => ev.error) : of(ev)))
    );

    const guardsCheckStart = router.events.pipe(first((ev2) => ev2 instanceof GuardsCheckStart));

    const resolveStart = router.events.pipe(first((ev2) => ev2 instanceof ResolveStart && ev2.id === ev.id));

    // Register simple background query until guards are being checked
    statusService.registerQuery(end.pipe(takeUntil(guardsCheckStart))).subscribe();

    const progressMessage = timer(1500).pipe(
        mergeMap(() =>
            of(routerUtil.getRoutesForUrl(ev.url)).pipe(
                mergeMap((routes) =>
                    routes.length > 0 ? titleService.getLocalizedTitleForRoute$(routes.slice(-1)[0]!) : of(null)
                ),
                map((routeTitle) => (routeTitle ? `Seite "${routeTitle}" wird geladen...` : `Seite wird geladen...`))
            )
        )
    );

    resolveStart.subscribe((_) => {
        // After guard check ended, register the blocking query with message
        statusService
            .registerQuery(end, {
                blocking: true,
                progressMessage,
            })
            // eslint-disable-next-line rxjs/no-nested-subscribe
            .subscribe();
    });
}
