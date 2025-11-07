import { PuiMetaRoute, RouterUtilService } from '@nexplore/practices-ui-tailwind';
import {
    Breadcrumb2Component,
    Breadcrumb3Component,
    BreadcrumbComponent,
} from './practices-ui-tailwind-samples/breadcrumb/breadcrumb.component';

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TitleService } from '@nexplore/practices-ui';
import { timer } from 'rxjs';
import { ButtonsComponent } from './practices-ui-tailwind-samples/buttons/buttons.component';
import { CheckboxesComponent } from './practices-ui-tailwind-samples/checkboxes/checkboxes.component';
import { ExpansionPanelsComponent } from './practices-ui-tailwind-samples/expansion-panels/expansion-panels.component';
import { FormElementsComponent } from './practices-ui-tailwind-samples/form-elements/form-elements.component';
import { FormWithHideInvalidComponent } from './practices-ui-tailwind-samples/form-with-hide-invalid/form-with-hide-invalid.component';
import { HomeComponent } from './practices-ui-tailwind-samples/home/home.component';
import { MiscComponent } from './practices-ui-tailwind-samples/misc/misc.component';
import { AppPopupsComponent } from './practices-ui-tailwind-samples/popups/popups.component';
import { RadioButtonsComponent } from './practices-ui-tailwind-samples/radio-buttons/radio-buttons.component';
import { SidePanelExampleComponent } from './practices-ui-tailwind-samples/side-panel/side-panel.component';
import { LongLoadingRouteComponent } from './practices-ui-tailwind-samples/status-hub/long-loading-route.component';
import { StatusHubComponent } from './practices-ui-tailwind-samples/status-hub/status-hub.component';
import { TablesInfiniteScrollingComponent } from './practices-ui-tailwind-samples/tables-infinite-scrolling/tables-infinite-scrolling.component';
import { TablesComponent } from './practices-ui-tailwind-samples/tables/tables.component';
import { TabsComponent } from './practices-ui-tailwind-samples/tabs/tabs.component';
import { TimelineExampleComponent } from './practices-ui-tailwind-samples/timeline/timeline.component';
import { ToastsComponent } from './practices-ui-tailwind-samples/toasts/toasts.component';
import { TypographyComponent } from './practices-ui-tailwind-samples/typography/typography.component';

export const APP_ROUTES: PuiMetaRoute[] = [
    {
        path: '',
        title: 'Home',
        component: HomeComponent,
        pathMatch: 'full',
        data: { breadcrumb: { showAsHomeIcon: true } },
    },
    {
        path: 'typography',
        title: 'Typography',
        component: TypographyComponent,
    },
    {
        path: 'form-elements',
        title: 'PageTitles.FormElements',
        component: FormElementsComponent,
    },
    {
        path: 'form-with-hide-invalid',
        title: 'PageTitles.FormWithHideInvalid',
        component: FormWithHideInvalidComponent,
    },
    {
        path: 'expansion-panels',
        title: 'PageTitles.ExpansionPanels',
        component: ExpansionPanelsComponent,
    },
    {
        path: 'tables',
        title: 'PageTitles.Tables',
        component: TablesComponent,
    },
    {
        path: 'tables-infinite-scrolling',
        title: 'PageTitles.TablesInfiniteScrolling',
        component: TablesInfiniteScrollingComponent,
    },
    {
        path: 'buttons',
        component: ButtonsComponent,
        title: 'PageTitles.Buttons',
    },
    {
        path: 'radio-buttons',
        title: 'PageTitles.RadioButtons',
        component: RadioButtonsComponent,
    },
    {
        path: 'checkboxes',
        title: 'PageTitles.Checkboxes',
        component: CheckboxesComponent,
    },
    {
        path: 'toasts',
        title: 'PageTitles.Toasts',
        component: ToastsComponent,
    },
    {
        path: 'popups',
        component: AppPopupsComponent,
        title: 'PageTitles.Popups',
    },
    {
        path: 'timeline',
        title: 'Timeline',
        component: TimelineExampleComponent,
    },
    {
        path: 'sidepanel',
        title: 'Sidepanel',
        component: SidePanelExampleComponent,
    },
    {
        path: 'status-hub',
        title: 'PageTitles.StatusHub',
        component: StatusHubComponent,
    },

    {
        path: 'status-hub/long-loading-route',
        title: 'Long loading route',
        data: { sideNav: { excludeFromMenu: true } },
        component: LongLoadingRouteComponent,
        resolve: {
            something: () => timer(10000),
        },
    },
    {
        path: 'misc',
        component: MiscComponent,
        title: 'PageTitles.Misc',
    },
    {
        path: 'tabs',
        component: TabsComponent,
        title: 'PageTitles.Tabs',
    },
    {
        path: 'lazy',
        title: 'Lazy loaded route',
        loadChildren: () =>
            import('./lazy-routing-sample/lazy-routing.routes').then((m) => m.LAZY_LOADING_SAMPLE_ROUTES),
    },
    {
        path: 'external',
        title: 'External link',
        redirectTo: 'http://www.google.com',
        data: {
            link: {
                href: 'http://www.google.com',
            },
        },
    },
    {
        path: 'breadcrumb',
        component: BreadcrumbComponent,
        title: 'PageTitles.Breadcrumb',
        children: [
            {
                path: 'sub1',
                title: 'Sub 1',
                data: { breadcrumb: { clickOpensSideNav: true } },
                resolve: {
                    data: (route: ActivatedRouteSnapshot) => {
                        const segments = inject(RouterUtilService).getSegmentsForActivatedRouteSnapshot(route);
                        inject(TitleService).setBreadcrumbTitle(`Custom title for this route`, {
                            breadcrumbUrl: segments[0].pathFromRoot,
                            localize: false,
                        });
                    },
                },
                children: [{ path: 'sub2', component: Breadcrumb3Component, title: 'Sub 2' }],
            },
            {
                path: 'sub1b',
                component: Breadcrumb2Component,
                title: 'Sub 1b',
                data: { breadcrumb: { clickOpensSideNav: true } },
                children: [
                    {
                        path: 'sub2b',
                        component: Breadcrumb3Component,
                        title: 'Sub 2b',
                    },
                ],
            },
            {
                path: 'sub1c',
                component: Breadcrumb2Component,
                data: { sideNav: { excludeFromMenu: true } },
                title: 'Sub 1c',
                children: [
                    {
                        path: 'sub2c',
                        component: Breadcrumb3Component,
                        title: 'Sub 2c',
                    },
                ],
            },
            {
                path: ':id1',
                component: Breadcrumb2Component,
                data: { sideNav: { excludeFromMenu: true } },
                title: 'Special Breadcrumb with id 1',
                resolve: {
                    data: (route: ActivatedRouteSnapshot) => {
                        const segments = inject(RouterUtilService).getSegmentsForActivatedRouteSnapshot(route);
                        const param = route.params.id1;
                        inject(TitleService).setBreadcrumbTitle(`Custom title for this route ${param}`, {
                            breadcrumbUrl: segments[0].pathFromRoot,
                            localize: false,
                        });
                    },
                },
                children: [
                    {
                        path: ':id2',
                        component: Breadcrumb3Component,
                        title: 'Special Breadcrumb with id 2',
                    },
                ],
            },
        ],
    },
];

