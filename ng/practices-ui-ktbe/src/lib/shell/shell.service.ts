import { Injectable, inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { getRoutesForUrl, routerLinkToString } from '../util/router.utils';

type RequestOpenRouteInSideMenuOptionsParam = ({ routePath: Route[] } | { routerLink: string | string[] }) & {
    routerConfig?: Route[];

    /**
     * Set `true` to disable the default behavior of expanding the sidemenu to the current url.
     *
     * An example of this default behavior:
     *
     * - Current url is : `admin/users/history`
     * - Method `openRouteInSideMenu` is called with `admin`
     * - Now the sidemenu will open `admin/users/history`, because the requested route is a parent of the current url.
     *
     * If disabled, then the sidemenu would instead open `admin`
     */
    disableExpandPathToCurrentUrl?: boolean;
};

type RequestOpenRouteInSideMenuConfig = Omit<RequestOpenRouteInSideMenuOptionsParam, 'routerLink' | 'routerConfig'> & {
    routePath: Route[];
};

@Injectable({ providedIn: 'root' })
export class PuibeShellService {
    private router = inject(Router);

    private requestOpenRouteInSideMenuSubject = new Subject<RequestOpenRouteInSideMenuConfig>();
    readonly requestOpenRouteInSideMenu$ = this.requestOpenRouteInSideMenuSubject.asObservable();

    openRouteInSideMenu(options: RequestOpenRouteInSideMenuOptionsParam): void;
    openRouteInSideMenu(route: Route[] | string, routerConfig?: Route[]): void;
    openRouteInSideMenu(options: RequestOpenRouteInSideMenuOptionsParam | Route[] | string, routerConfig?: Route[]) {
        routerConfig =
            (typeof options === 'object' && 'routerConfig' in options ? options.routerConfig : routerConfig) ??
            routerConfig ??
            this.router.config;

        let config: RequestOpenRouteInSideMenuConfig;
        if (options instanceof Array) {
            config = { routePath: options };
        } else if (typeof options === 'object') {
            if ('routerLink' in options) {
                const url = routerLinkToString(options.routerLink);
                config = { ...options, routePath: getRoutesForUrl(url, routerConfig) };
            } else if ('routePath' in options) {
                config = options;
            }
        } else if (typeof options === 'string') {
            const url = routerLinkToString(options);
            config = { routePath: getRoutesForUrl(url, routerConfig) };
        } else {
            // Empty array, means open the path for the current url of the window
            config = { routePath: [] };
        }

        this.requestOpenRouteInSideMenuSubject.next(config);
    }
}
