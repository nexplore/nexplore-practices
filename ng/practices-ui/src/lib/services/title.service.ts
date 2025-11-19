import { Inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Route, Router, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Observable, of, BehaviorSubject, merge, map, filter } from 'rxjs';

/**
 * Configuration for the TitleService.
 *
 * @param {function?} [titleTransformer] - A function that takes in a string and transforms it to another string to be used as the page title.
 * @param {boolean?} [autoSetBreadcrumbTitle] - A boolean indicating whether or not to automatically set the breadcrumb title to match the page title.
 * @param {boolean?} [localize] - A boolean indicating whether or not to localize the page title.
 * @example
 * // Configure the TitleService with a custom title transformer function, disable automatically setting the breadcrumb title and disable localization.
 * providePractices({ titleServiceConfig: { titleTransformer: (title) => `${title} | My App`, autoSetBreadcrumbTitle: false, localize: false }});
 */
export type TitleServiceConfig = {
    titleTransformer: (title: string) => string;
    autoSetBreadcrumbTitle: boolean;
    localize: boolean;
};

export type BreadcrumbTitle = {
    title: string;
    url: string;
    isAutoSet: boolean;
};

export const TITLE_SERVICE_CONFIG = new InjectionToken<TitleServiceConfig>('TitleServiceConfig');

@Injectable()
export class TitleService extends TitleStrategy {
    private _titleSubject: Subject<string> = new BehaviorSubject<string>('');
    private _breadcrumbTitlesSubject = new BehaviorSubject<BreadcrumbTitle[]>([]);

    readonly title$: Observable<string> = this._titleSubject.asObservable();
    readonly breadcrumbTitles$: Observable<BreadcrumbTitle[]> = this._breadcrumbTitlesSubject.asObservable();

    constructor(
        @Inject(TITLE_SERVICE_CONFIG) private readonly _config: TitleServiceConfig,
        private readonly _injector: Injector,
        private readonly _angularTitleService: Title,
        private readonly _translateService: TranslateService
    ) {
        super();
    }

    /**
     * Get an observable of the localized title of the specified route
     */
    public getLocalizedTitleForRoute$(route: Route) {
        if (this._config.localize && typeof route?.title === 'string') {
            return this._translateService.get(route.title!);
        } else {
            return of(route?.title);
        }
    }

    /**
     * Get an observable of the localized title of the specified route.
     *
     * @param relativeUrl The url to get the title for
     * @param defaultTitle The default title that will be displayed if not overridden
     * @param options Additonal options - `fallbackAliasUrls` If no breadcrumb title is found for the `url`, try to find a title for the fallback url (This is useful for when a route could be with or without qury params, another use case is projects with ng-upgrade projects, where a application can run with different urls).
     * @returns An infinite stream of the current title as well as future updates, until unsubscribed.
     */
    public getLocalizedBreadcrumbTitleForRoute$(
        relativeUrl: string,
        defaultTitle: string | null,
        options?: { fallbackAliasUrls?: string[] }
    ) {
        function findBreadcrumbTitle(arr: BreadcrumbTitle[]): string | undefined {
            let result = arr.find((breadcrumbTitle) => relativeUrl === breadcrumbTitle.url);

            if (!result && options?.fallbackAliasUrls?.length) {
                result = arr.find((breadcrumbTitle) => options?.fallbackAliasUrls?.includes(breadcrumbTitle.url));
            }

            return result?.title;
        }

        return merge(
            this._config.localize && typeof defaultTitle === 'string'
                ? this._translateService.stream(defaultTitle!)
                : of(defaultTitle),
            this._breadcrumbTitlesSubject.pipe(map((arr) => findBreadcrumbTitle(arr)))
        ).pipe(filter((title) => title !== null && title !== undefined));
    }

    /**
     * Set the breadcrumb title.
     *
     * @param {string} title - The title to set as the breadcrumb title.
     * @param {string?} [overrideConfig.breadcrumbUrl] - The url segment on which the title should be shown,
     * @param {boolean?} [overrideConfig.localize] - A boolean indicating whether or not to localize the breadcrumb title,
     * ignoring the services configuration of `localize`.
     */
    public setBreadcrumbTitle(
        title: string,
        overrideConfig?: { breadcrumbUrl?: string } & Partial<Pick<TitleServiceConfig, 'localize'>>
    ): void {
        this._setBreadcrumbTitleWithAutoSet(false, title, overrideConfig);
    }

    /**
     * Set the page title.
     *
     * @param {string} title - The title to set as the page (and possibly breadcrumb) title.
     * @param {boolean?} [overrideConfig.localize] - A boolean indicating whether or not to localize the breadcrumb title,
     * ignoring the services configuration of `localize`.
     * @returns {void}
     */
    public setTitle(
        title: string,
        overrideConfig?: Partial<Pick<TitleServiceConfig, 'localize' | 'autoSetBreadcrumbTitle'>>
    ): void {
        const localize = overrideConfig?.localize ?? this._config.localize;
        const autoSetBreadcrumbTitle = overrideConfig?.autoSetBreadcrumbTitle ?? this._config.autoSetBreadcrumbTitle;

        if (localize) {
            title = this._translateService.instant(title);
        }

        if (autoSetBreadcrumbTitle) {
            this._setBreadcrumbTitleWithAutoSet(true, title, { localize: false });
        }

        this._titleSubject.next(title);

        const mappedTitle = this._config.titleTransformer ? this._config.titleTransformer(title) : title;
        this._angularTitleService.setTitle(mappedTitle);
    }

    /** @inheritdoc */
    public updateTitle(snapshot: RouterStateSnapshot): void {
        const title = this.buildTitle(snapshot);

        if (!title) {
            return;
        }

        this.setTitle(title, { autoSetBreadcrumbTitle: false });
    }

    /**
     * Set the breadcrumb title.
     *
     * @param {boolean} isAutoSet - If this flag is set, the title will only be overriden if it has not been set manually.
     * @param {string} title - The title to set as the breadcrumb title.
     * @param {string?} [overrideConfig.breadcrumbUrl] - The url segment on which the title should be shown,
     * @param {boolean?} [overrideConfig.localize] - A boolean indicating whether or not to localize the breadcrumb title,
     * ignoring the services configuration of `localize`.
     */
    private _setBreadcrumbTitleWithAutoSet(
        isAutoSet: boolean,
        title: string,
        overrideConfig?: { breadcrumbUrl?: string } & Partial<Pick<TitleServiceConfig, 'localize'>>
    ): void {
        const localize = overrideConfig?.localize ?? this._config.localize;

        if (localize) {
            title = this._translateService.instant(title);
        }

        const url = overrideConfig?.breadcrumbUrl ?? this._injector.get(Router).url;

        // TODO: Should we also additionally register the url WITHOUT query params?

        const indexOfExistingRoute = this._breadcrumbTitlesSubject.value.findIndex(
            (breadcrumbTitle) => breadcrumbTitle.url === url
        );

        if (indexOfExistingRoute >= 0) {
            const nextBreadcrumbTitles = [...this._breadcrumbTitlesSubject.value];
            if (!isAutoSet || nextBreadcrumbTitles[indexOfExistingRoute].isAutoSet) {
                nextBreadcrumbTitles[indexOfExistingRoute] = { title, url, isAutoSet };
                this._breadcrumbTitlesSubject.next(nextBreadcrumbTitles);
            }
        } else {
            this._breadcrumbTitlesSubject.next([...this._breadcrumbTitlesSubject.value, { title, url, isAutoSet }]);
        }
    }
}
