import { Data, Route } from '@angular/router';

export type LinkRel =
    | 'alternate'
    | 'author'
    | 'bookmark'
    | 'external'
    | 'help'
    | 'license'
    | 'next'
    | 'nofollow'
    | 'noopener'
    | 'noreferrer'
    | 'prev'
    | 'search'
    | 'tag';

export type LinkTarget = '_blank' | '_self' | '_parent' | '_top' | string;

export interface PuibeMetaRoute<TData = unknown> extends Route {
    data?: Data & {
        /** Allows to specify external links, and costumize behavior */
        link?: {
            /** Specify anchor href, can be any absolute url. Alternatively you can also just set `redirectTo` on the route config itself. */
            href?: string;
            rel?: LinkRel;
            target?: LinkTarget;
        };

        /** Specify a list of urls, of which this nav-item is marked to be the parent.
         * This might be useful for when child routes use redirects, and helps the side-nav menu to know where a currently active url belongs inside the hierarchical menu, so it can be correctly expand the right pane.
         * Strings support Wildcard `*` characters. Alternatively pass a /RegExp/ object.
         */
        subChildrenAliasUrls?: Array<string | RegExp>;
        /** Customize how this route is displayed in the side navigation */
        sideNav?: {
            excludeFromMenu?: boolean;
        };
        /** Customize how this route is displayed in the breadcrumbs */
        breadcrumb?: {
            clickOpensSideNav?: boolean;
            excludeFromBreadcrumb?: boolean;
            showAsHomeIcon?: boolean;
            /** Customize the title for breadcrumbs */
            title?: string;
        };
    } & TData;

    children?: PuibeMetaRoute<TData>[];
}

export type PuibeMetaRoutes<TData = unknown> = PuibeMetaRoute<TData>[];
