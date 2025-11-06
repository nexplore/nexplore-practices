import { Routes } from '@angular/router';
import { describe, expect, it } from '@jest/globals';
import { PuibeMetaRoute } from '../../index';
import {
    applyParameterizedUrlSegmentToPathTemplate,
    getHrefRelativePath,
    getRoutesForUrl,
    getUrlForRoutes,
    normalizeUrlForComparision,
} from './router.utils';
import { TEST_COMPLEX_ROUTE_CONFIG } from './spec/test-route-config';
import { TEST_COMPLEX_ROUTE_CONFIG_2 } from './spec/test-route-config-2';

describe('normalizeUrlForComparision', () => {
    it('should compare with normalized leading slash', () => {
        const baseUrl = './';
        const url1 = normalizeUrlForComparision(getHrefRelativePath('/ihpclearings'), baseUrl);
        const url2 = normalizeUrlForComparision(getHrefRelativePath('./#/ihpclearings'), baseUrl);
        expect(url1).toEqual(url2);
    });

    it('should compare with normalized no leading', () => {
        const baseUrl = './';
        const url1 = normalizeUrlForComparision(getHrefRelativePath('ihpclearings'), baseUrl);
        const url2 = normalizeUrlForComparision(getHrefRelativePath('./#/ihpclearings'), baseUrl);
        expect(url1).toEqual(url2);
    });

    it('should compare with normalized absolute base url ', () => {
        const baseUrl = 'http://localhost:61630/#/';
        const url1 = normalizeUrlForComparision(getHrefRelativePath('ihpclearings'), baseUrl);
        const url2 = normalizeUrlForComparision(getHrefRelativePath('http://localhost:61630/#/ihpclearings'), baseUrl);
        expect(url1).toEqual(url2);
    });

    it('should compare with normalized absolute base url 2', () => {
        const baseUrl = 'http://localhost:61630/#/';
        const url1 = normalizeUrlForComparision(getHrefRelativePath('/ihpclearings'), baseUrl);
        const url2 = normalizeUrlForComparision(getHrefRelativePath('#/ihpclearings'), baseUrl);
        expect(url1).toEqual(url2);
    });
});

describe('getRoutesForUrl', () => {
    it('should compose routes by path', () => {
        const ccc = {
            path: 'ccc',
        };
        const bbb = {
            path: 'bbb',
            children: [ccc],
        };
        const aaa = {
            path: 'aaa',
            children: [bbb],
        };
        const routes: Routes = [aaa];

        const path = 'aaa/bbb/ccc';
        const res = getRoutesForUrl(path, routes);
        expect(res.map((x) => x.path)).toEqual([aaa, bbb, ccc].map((x) => x.path));
    });

    it('should compose routes by path with leading / ', () => {
        const ccc = {
            path: 'ccc',
        };
        const bbb = {
            path: 'bbb',
            children: [ccc],
        };
        const aaa = {
            path: 'aaa',
            children: [bbb],
        };
        const routes: Routes = [aaa];

        const path = '/aaa/bbb/ccc';
        const res = getRoutesForUrl(path, routes);
        expect(res.map((x) => x.path)).toEqual([aaa, bbb, ccc].map((x) => x.path));
    });

    it('should compose routes by path with leading / and include home', () => {
        const ccc = {
            path: 'ccc',
        };
        const bbb = {
            path: 'bbb',
            children: [ccc],
        };
        const aaa = {
            path: 'aaa',
            children: [bbb],
        };
        const home = {
            path: '',
        };
        const routes: Routes = [home, aaa];

        const path = '/aaa/bbb/ccc';
        const res = getRoutesForUrl(path, routes, { includeHomeSlashRoute: true });
        expect(res.map((x) => x.path)).toEqual([home, aaa, bbb, ccc].map((x) => x.path));
    });

    it('should compose routes by path with leading / and include home with matching redirect link', () => {
        const ccc = {
            path: 'ccc',
        };
        const bbb = {
            path: 'bbb',
            children: [ccc],
        };
        const aaa = {
            path: 'aaa',
            children: [bbb],
        };
        const home = {
            path: 'home',
            data: { link: { href: './#/' } },
        };
        const routes: Routes = [home, aaa];

        const path = '/aaa/bbb/ccc';
        const res = getRoutesForUrl(path, routes, { includeHomeSlashRoute: true });
        expect(res.map((x) => x.path)).toEqual([home, aaa, bbb, ccc].map((x) => x.path));
    });

    it('should compose routes by path with leading / and not include external url', () => {
        const ccc = {
            path: 'ccc',
        };
        const bbb = {
            path: 'bbb',
            children: [ccc],
        };
        const aaa = {
            path: 'aaa',
            children: [bbb],
        };
        const home = {
            path: 'home',
            data: { link: { href: './#/' } },
        };
        const routes: Routes = [home, aaa, { path: 'external', data: { link: { href: 'http://www.google.com' } } }];

        const path = '/aaa/bbb/ccc';
        const res = getRoutesForUrl(path, routes, { includeHomeSlashRoute: true });
        expect(res.map((x) => x.path)).toEqual([home, aaa, bbb, ccc].map((x) => x.path));
    });
    it('should compose routes by path with path-params', () => {
        const ccc = {
            path: ':param',
        };
        const bbb = {
            path: 'bbb',
            children: [ccc],
        };
        const aaa = {
            path: 'aaa',
            children: [bbb],
        };
        const home = {
            path: 'home',
            data: { link: { href: './#/' } },
        };
        const routes: Routes = [home, aaa];

        const path = '/aaa/bbb/ccc';
        const res = getRoutesForUrl(path, routes, { includeHomeSlashRoute: true });
        expect(res.map((x) => x.path)).toEqual([home, aaa, bbb, ccc].map((x) => x.path));
    });

    it('should compose routes by path with path-params in the middle', () => {
        const ccc = {
            path: 'ccc',
        };
        const bbb = {
            path: ':param',
            children: [ccc],
        };
        const aaa = {
            path: 'aaa',
            children: [bbb],
        };
        const home = {
            path: 'home',
            data: { link: { href: './#/' } },
        };
        const routes: Routes = [home, aaa];

        const path = '/aaa/bbb/ccc';
        const res = getRoutesForUrl(path, routes, { includeHomeSlashRoute: true });
        expect(res.map((x) => x.path)).toEqual([home, aaa, bbb, ccc].map((x) => x.path));
    });

    it('should compose routes by path with consecutive path-params', () => {
        const ccc = {
            path: ':param2',
        };
        const bbb = {
            path: ':param1',
            children: [ccc],
        };
        const aaa = {
            path: 'aaa',
            children: [bbb],
        };
        const home = {
            path: 'home',
            data: { link: { href: './#/' } },
        };
        const routes: Routes = [home, aaa];

        const path = '/aaa/bbb/ccc';
        const res = getRoutesForUrl(path, routes, { includeHomeSlashRoute: true });
        expect(res.map((x) => x.path)).toEqual([home, aaa, bbb, ccc].map((x) => x.path));
    });

    it('should work with real work example 1', () => {
        const routes = [
            {
                title: 'Headers.HomeWelcome',
                path: 'home',
                data: { link: { href: `./#/` } },
                redirectTo: `./#/`,
            },
            {
                path: 'admin',
                title: 'Headers.Admin',
                data: {
                    openInSidenav: true,
                    subChildrenAliasUrls: ['/manageMasterData', '/users', '/templates', '/reporting'],
                },
                children: [
                    {
                        path: 'manage-master-data',
                        title: 'Headers.ManageMasterData',
                        data: { link: { href: `./#/manageMasterData` } },
                    },
                    {
                        path: 'users',
                        title: 'Headers.UsersList',
                        redirectTo: `./#/users`,
                        data: { link: { href: `./#/users` } },
                    },
                    {
                        path: 'templates',
                        title: 'Headers.Templates',
                        redirectTo: `./#/templates`,
                        data: { link: { href: `./#/templates` } },
                    },
                    {
                        path: 'reporting',
                        title: 'Headers.Reporting',
                        redirectTo: `./#/reporting`,
                        data: { link: { href: `./#/reporting` } },
                    },
                ],
            },
        ];

        const res = getRoutesForUrl('/manageMasterData', routes, { baseUrl: './#/', includeHomeSlashRoute: true });

        expect(res.map((x) => x.path)).toEqual(['home', 'admin', 'manage-master-data']);
    });

    it('should work with real work example 2', () => {
        const routes = [
            {
                title: 'Headers.HomeWelcome',
                path: 'home',
                data: { link: { href: `./#/` } },
                redirectTo: `./#/`,
            },
            {
                path: 'current-mandate',
                title: '{{virtualMandate}}',
                data: {
                    openInSidenav: true,
                    menuIdentifier: 'current-mandate',
                    displayOrder: 99,
                    subChildrenAliasUrls: ['/ihpServiceConsumption', '/ihpclearings', '/ihpclearings/month/:id'],
                },
                children: [
                    {
                        path: 'ihp-service-consumption',
                        title: 'Headers.IhpServiceConsumptionMenuItem',
                        data: {
                            openInSidenav: true,
                            menuIdentifier: 'IhpServiceConsumptionMenuItem',
                            canConditionallyMoveToMainMenu: true,
                            subChildrenAliasUrls: [
                                '/ihpServiceConsumption',
                                '/ihpclearings',
                                '/ihpclearings/month/:id',
                            ],
                        },
                        children: [
                            {
                                path: 'ihp-clearing',
                                children: [
                                    {
                                        path: '',
                                        data: {
                                            breadcrumb: { title: 'Headers.IhpClearingsOverview' },
                                            link: { href: './#/ihpclearings' },
                                            subChildrenAliasUrls: ['/ihpclearings', '/ihpclearings/month/:id'],
                                        },
                                        children: [
                                            {
                                                path: '',
                                                title: 'Headers.IhpClearingsOverview',
                                                data: {
                                                    menuIdentifier: 'ihpclearings/overview',
                                                    subChildrenAliasUrls: ['/ihpclearings'],
                                                },
                                                redirectTo: `./#/ihpclearings`,
                                            },
                                            {
                                                path: 'month/:id',
                                                title: 'Headers.IhpClearingsOverviewMonthDetail',
                                                data: {
                                                    classicUrlTemplate: '/ihpclearings/month/:id',
                                                    menuIdentifier: 'ihpclearings/overview/month/detail',
                                                    sideNav: {
                                                        excludeFromMenu: true,
                                                    },
                                                    subChildrenAliasUrls: ['/ihpclearings/month/:id'],
                                                },
                                            },
                                            {
                                                path: 'month/salary-payment-continuation-case/:salaryPaymentContinuationCaseId',
                                                title: 'Headers.SalaryPaymentContinuationCaseDetail',
                                                data: { sideNav: { excludeFromMenu: true } },
                                            },
                                            {
                                                path: 'month/:id/salary-payment-continuation-case/:salaryPaymentContinuationCaseId',
                                                title: 'Headers.SalaryPaymentContinuationCaseDetail',
                                                data: { sideNav: { excludeFromMenu: true } },
                                            },
                                            {
                                                path: 'month/:id/salary-payment-continuation-case',
                                                title: 'Headers.SalaryPaymentContinuationCaseDetail',
                                                data: { sideNav: { excludeFromMenu: true } },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];

        const res = getRoutesForUrl(
            '/current-mandate/ihp-service-consumption/ihp-clearing/month/11ab1d91-8fba-428e-b348-21e3ff6d3533',
            routes,
            { baseUrl: './#/', includeHomeSlashRoute: true }
        );

        expect(res.map((x) => x.path)).toEqual([
            'home',
            'current-mandate',
            'ihp-service-consumption',
            'ihp-clearing',
            '',
            'month/:id',
        ]);

        const tail = res.at(-1);
        expect(tail.appliedParams).toEqual({ ':id': '11ab1d91-8fba-428e-b348-21e3ff6d3533' });

        function transformRoutesToAbsoluteUrls(routes: PuibeMetaRoute[]) {
            return routes?.map((r) => ({
                ...r,
                data: {
                    ...r.data,
                    subChildrenAliasUrls: r.data?.subChildrenAliasUrls?.map((url) =>
                        (url as string).replace('./#', 'http://localhost:61630')
                    ),
                },
                children: transformRoutesToAbsoluteUrls(r.children),
            }));
        }
        const routes2 = transformRoutesToAbsoluteUrls(routes);

        const res2 = getRoutesForUrl(
            '/current-mandate/ihp-service-consumption/ihp-clearing/month/11ab1d91-8fba-428e-b348-21e3ff6d3533',
            routes2,
            { baseUrl: 'http://localhost:8888', includeHomeSlashRoute: true }
        );

        expect(res2.map((x) => x.path)).toEqual([
            'home',
            'current-mandate',
            'ihp-service-consumption',
            'ihp-clearing',
            '',
            'month/:id',
        ]);
    });
    it('should work with real work example 3', () => {
        const routes = [
            {
                title: 'Headers.HomeWelcome',
                path: 'home',
                data: { link: { href: `./#/` } },
                redirectTo: `./#/`,
            },
            {
                path: 'current-mandate',
                title: '{{virtualMandate}}',
                data: {
                    openInSidenav: true,
                    menuIdentifier: 'current-mandate',
                    displayOrder: 99,
                },
                children: [
                    {
                        path: 'ihp-service-consumption',
                        title: 'Headers.IhpServiceConsumptionMenuItem',
                        data: {
                            openInSidenav: true,
                            menuIdentifier: 'IhpServiceConsumptionMenuItem',
                            canConditionallyMoveToMainMenu: true,
                            subChildrenAliasUrls: ['/ihpServiceConsumption'],
                        },
                        children: [
                            {
                                path: 'ihp-service-provider',
                                title: 'Headers.IhpServiceProvider',
                                data: { menuIdentifier: 'ihpserviceproviders/list' },
                                children: [
                                    {
                                        path: '',
                                        children: [
                                            {
                                                path: '',
                                                title: 'Headers.IhpServiceProvider',
                                                data: { sideNav: { excludeFromMenu: true } },
                                            },
                                            {
                                                path: 'detail/:id',
                                                data: {
                                                    sideNav: { excludeFromMenu: true },
                                                    breadcrumb: { title: 'Headers.Details' },
                                                },
                                                children: [
                                                    {
                                                        path: '',
                                                        data: {
                                                            sideNav: { excludeFromMenu: true },
                                                            breadcrumb: { title: 'Headers.Details' },
                                                        },
                                                        title: 'Headers.IhpServiceProvider',
                                                    },
                                                    {
                                                        path: 'history-data/:historyDataId',
                                                        data: { sideNav: { excludeFromMenu: true } },
                                                        title: 'Headers.IhpDayCareCenterHistoryData',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const res = getRoutesForUrl(
            '/current-mandate/ihp-service-consumption/ihp-service-provider/detail/789c8b48-d857-45a6-b7b3-fa9616f8adf5/history-data/a7436df6-39d6-4051-b70b-6197002d5d9f',
            routes,
            { baseUrl: './#/', includeHomeSlashRoute: true }
        );

        expect(res.map((x) => x.path)).toEqual([
            'home',
            'current-mandate',
            'ihp-service-consumption',
            'ihp-service-provider',
            '',
            'detail/:id',
            'history-data/:historyDataId',
        ]);
    });

    it('should work with real work example 4', () => {
        const routes = [
            {
                path: 'home',
                data: { link: { href: `./#/` } },
                redirectTo: `./#/`,
            },
            {
                path: 'current-mandate/ihpfundingsources',
                data: {
                    link: {
                        href: `./#/ihpfundingsources`,
                    },
                    subChildrenAliasUrls: [
                        `/ihpfundingsources/:id`,
                        `/ihpfundingsources/historydata/create/:fundingSourceId`,
                        `/ihpfundingsources/historydata/edit/:id`,
                    ],
                },
                children: [
                    {
                        path: ':id',
                        redirectTo: `./#/ihpfundingsources/:id`,
                        data: { link: { href: './#/ihpfundingsources/:id' } },
                    },
                    {
                        path: 'historydata/create/:fundingSourceId',
                        redirectTo: `./#/ihpfundingsources/historydata/create/:fundingSourceId`,
                    },
                    {
                        path: 'historydata/edit/:id',
                        redirectTo: `./#/ihpfundingsources/historydata/edit/:id`,
                    },
                ],
            },
        ];

        const res = getRoutesForUrl('/ihpfundingsources/2e2788e6-91c9-4a2a-813b-29e1f8cf3295', routes, {
            baseUrl: 'http://localhost:61630/#/',
            includeHomeSlashRoute: true,
        });

        expect(res.map((x) => x.path)).toEqual(['home', 'current-mandate/ihpfundingsources', ':id']);

        const tail = res.at(-1);
        expect(tail.appliedParams).toEqual({ ':id': '2e2788e6-91c9-4a2a-813b-29e1f8cf3295' });
        expect(tail.redirectTo).toEqual('./#/ihpfundingsources/2e2788e6-91c9-4a2a-813b-29e1f8cf3295');
    });

    it('should work with real work example 5', () => {
        const routes = [
            {
                path: 'home',
                data: { link: { href: `./#/` } },
                redirectTo: `./#/`,
            },
            {
                path: 'representations',
                data: {
                    link: { href: `./#/representations` },
                    subChildrenAliasUrls: [
                        `/representations/create`,
                        `/representations/:id`,
                        `/representations/:id/user`,
                    ],
                },
                children: [
                    {
                        path: 'create',
                        redirectTo: `./#/representations/create`,
                        data: { link: { href: `./#/representations/create` } },
                    },
                    {
                        path: ':id',
                        data: {
                            link: { href: `./#/representations/:id` },
                            subChildrenAliasUrls: [`/representations/:id/user`],
                        },
                        children: [
                            {
                                path: 'user',
                                data: { link: { href: `./#/representations/:id/user` } },
                                redirectTo: `./#/representations/:id/user`,
                            },
                        ],
                    },
                ],
            },
        ];

        const res = getRoutesForUrl('/representations/5dc8d37d-0a2c-469d-aa03-1733362b0abc/user', routes, {
            baseUrl: './#/',
            includeHomeSlashRoute: true,
        });

        expect(res.map((x) => x.path)).toEqual(['home', 'representations', ':id', 'user']);

        const tail = res.at(-1);
        expect(tail.appliedParams).toEqual({ ':id': '5dc8d37d-0a2c-469d-aa03-1733362b0abc' });
        expect(tail.redirectTo).toEqual('./#/representations/5dc8d37d-0a2c-469d-aa03-1733362b0abc/user');
    });

    it('should work with real work example 6', () => {
        const routes = [
            {
                path: 'home',
                data: { link: { href: `./#/` } },
                redirectTo: `./#/`,
            },
            {
                path: 'ihp-clearing',
                data: {
                    subChildrenAliasUrls: [`/ihpclearings`, `/ihpclearings/:id`],
                },
                children: [
                    {
                        path: '',
                        data: {
                            breadcrumb: { title: 'Headers.IhpClearingsOverview' },
                            link: { href: './#/ihpclearings' },
                            data: {
                                subChildrenAliasUrls: [`/ihpclearings`, `/ihpclearings/:id`],
                            },
                        },
                        children: [
                            {
                                path: '',
                                data: { link: { href: `./#/ihpclearings` } },
                                redirectTo: `./#/ihpclearings`,
                            },

                            {
                                path: ':id',
                                data: {
                                    data: { link: { href: `./#/ihpclearings/:id` } },
                                },
                                redirectTo: `./#/ihpclearings/:id`,
                            },
                        ],
                    },
                ],
            },
        ];

        const res = getRoutesForUrl('/ihpclearings', routes, {
            baseUrl: './',
            includeHomeSlashRoute: true,
        });

        expect(res.map((x) => x.path)).toEqual(['home', 'ihp-clearing', '', '']);

        const tail = res.at(-1);
        expect(tail.appliedParams).toEqual(null);

        const res2 = getRoutesForUrl('/ihpclearings', routes, {
            baseUrl: './',
            fullMatch: true,
        });

        expect(res2.map((x) => x.path)).toEqual(['ihp-clearing', '', '']);

        const res3 = getRoutesForUrl('/ihpclearings', routes, {
            baseUrl: 'http://localhost:61630/#/',
            fullMatch: true,
        });

        expect(res3.map((x) => x.path)).toEqual(['ihp-clearing', '', '']);
    });

    it('should work with real work example 7', () => {
        const routes = [
            {
                path: 'home',
                data: { link: { href: `./#/` } },
                redirectTo: `./#/`,
            },
            {
                title: 'Headers.IhpFundingSourcesList',
                path: 'current-mandate/ihpfundingsources',
                data: {
                    menuIdentifier: 'ihpfundingsources/list',
                    link: {
                        href: `./#/ihpfundingsources`,
                    },
                },
                children: [
                    {
                        title: 'Headers.IhpFundingSourcesDetail',
                        path: ':id',
                        data: {
                            link: {
                                href: `./#/ihpfundingsources/:id`,
                            },
                        },

                        children: [
                            {
                                title: 'Headers.IhpFundingSourceHistoryData',
                                path: 'historydata/create/:fundingSourceId',
                                redirectTo: `./#/ihpfundingsources/historydata/create/:fundingSourceId`,
                            },
                            {
                                title: 'Headers.IhpFundingSourceHistoryData',
                                path: 'historydata/edit/:historyDataId',
                                redirectTo: `./#/ihpfundingsources/historydata/edit/:historyDataId`,
                            },
                        ],
                    },
                ],
            },
        ];

        const res = getRoutesForUrl(
            '/current-mandate/ihpfundingsources/be637f15-6b1c-4ce0-8c2d-017f05eb8d42/historydata/edit/fc115fb2-124d-4820-8ca9-c495456af602',
            routes,
            {
                baseUrl: './#/',
                includeHomeSlashRoute: true,
            }
        );

        expect(res.map((x) => x.path)).toEqual([
            'home',
            'current-mandate/ihpfundingsources',
            ':id',
            'historydata/edit/:historyDataId',
        ]);

        const tail = res.at(-1);
        expect(tail.appliedParams).toEqual({
            ':historyDataId': 'fc115fb2-124d-4820-8ca9-c495456af602',
            ':id': 'be637f15-6b1c-4ce0-8c2d-017f05eb8d42',
        });
        expect(tail.redirectTo).toEqual('./#/ihpfundingsources/historydata/edit/fc115fb2-124d-4820-8ca9-c495456af602');
    });

    it('should work with real work example 8', () => {
        const routes = TEST_COMPLEX_ROUTE_CONFIG;

        const url = '/current-mandate/personal-data/ihp-assessments/75f1c869-b7d5-4919-966f-4e4263dd8966/instrument';

        const res = getRoutesForUrl(url, routes, {
            baseUrl: './#/',
            includeHomeSlashRoute: true,
            fullMatch: true,
        });

        expect(res.map((x) => x.path)).toEqual([
            '',
            'current-mandate',
            'personal-data',
            'ihp-assessments',
            ':id',
            'instrument',
        ]);

        const tail = res.at(-1);
        expect(tail.appliedParams).toEqual({
            ':id': '75f1c869-b7d5-4919-966f-4e4263dd8966',
        });
        expect(tail.redirectTo).toEqual(
            'http://localhost:61630/#/ihpAssessments/75f1c869-b7d5-4919-966f-4e4263dd8966/instrument/'
        );
    });

    it('should work with real work example 9', () => {
        const routes = TEST_COMPLEX_ROUTE_CONFIG_2;

        const url = '/current-mandate/minimal-data';

        const res = getRoutesForUrl(url, routes, {
            baseUrl: './#/',
            includeHomeSlashRoute: true,
            fullMatch: true,
        });

        expect(res.map((x) => x.path)).toEqual(['', 'current-mandate', 'minimal-data', '']);
    });
});

describe('getUrlForRoutes', () => {
    it('should correctly print url', () => {
        const ccc = {
            path: 'ccc',
        };
        const bbb = {
            path: 'bbb',
            children: [ccc],
        };
        const aaa = {
            path: 'aaa',
            children: [bbb],
        };
        const routes: Routes = [aaa, bbb, ccc];

        const path = 'aaa/bbb/ccc';
        const res = getUrlForRoutes(routes);
        expect(res).toEqual(path);
    });

    it('should skip ending slashes and whitespaces', () => {
        const routes: Routes = ['/', '/', 'bbb', '', '', '/ddd/', '/'].map((path) => ({ path }));

        const path = '/bbb/ddd';
        const res = getUrlForRoutes(routes);
        expect(res).toEqual(path);
    });
});

describe('applyParameterizedUrlSegmentToPathTemplate', () => {
    it('should apply params', () => {
        const expectedResult = `/xyz/myid/abc`;
        const route = '/xyz/:id/abc';
        const appliedMatch = applyParameterizedUrlSegmentToPathTemplate({
            urlWithParams: expectedResult,
            pathTemplate: route,
        });
        expect(appliedMatch.pathWithAppliedParams).toEqual(expectedResult);
    });

    it('should apply params at last pos', () => {
        const expectedResult = `/xyz/myid`;
        const route = '/xyz/:id';
        const appliedMatch = applyParameterizedUrlSegmentToPathTemplate({
            urlWithParams: expectedResult,
            pathTemplate: route,
        });
        expect(appliedMatch.pathWithAppliedParams).toEqual(expectedResult);
    });

    it('should apply params with alias url', () => {
        const expectedResult = `/xyz/0000/abc`;
        const aliasUrlTmpl = 'someting/else/:id/wusa';
        const aliasUrl = 'someting/else/0000/wusa';
        const route = '/xyz/:id/abc';
        const appliedMatch = applyParameterizedUrlSegmentToPathTemplate({
            aliasUrlTemplate: aliasUrlTmpl,
            pathTemplate: route,
            urlWithParams: aliasUrl,
        });
        expect(appliedMatch.pathWithAppliedParams).toEqual(expectedResult);
    });

    it('should apply params with alias url at last pos', () => {
        const expectedResult = `/xyz/0000`;
        const aliasUrlTmpl = 'someting/else/:id';
        const aliasUrl = 'someting/else/0000';
        const route = '/xyz/:id';
        const appliedMatch = applyParameterizedUrlSegmentToPathTemplate({
            aliasUrlTemplate: aliasUrlTmpl,
            pathTemplate: route,
            urlWithParams: aliasUrl,
        });
        expect(appliedMatch.pathWithAppliedParams).toEqual(expectedResult);
    });

    it('should apply params with alias url with leading slash', () => {
        const expectedResult = `/xyz/0000/abc`;
        const aliasUrlTmpl = '/someting/else/:id/wusa';
        const aliasUrl = 'someting/else/0000/wusa';
        const route = '/xyz/:id/abc';
        const appliedMatch = applyParameterizedUrlSegmentToPathTemplate({
            aliasUrlTemplate: aliasUrlTmpl,
            pathTemplate: route,
            urlWithParams: aliasUrl,
        });
        expect(appliedMatch.pathWithAppliedParams).toEqual(expectedResult);
    });

    it('should apply params with complex alias url', () => {
        const expectedResult = `/current-mandate/ihp-service-consumption/ihp-clearing/month/f9c274ab-7bc1-494f-8844-807abe1b6319`;
        const aliasUrlTmpl = '/ihpclearings/month/:id';
        const aliasUrl = '/ihpclearings/month/f9c274ab-7bc1-494f-8844-807abe1b6319';
        const route = '/current-mandate/ihp-service-consumption/ihp-clearing/month/:id';
        const appliedMatch = applyParameterizedUrlSegmentToPathTemplate({
            aliasUrlTemplate: aliasUrlTmpl,
            pathTemplate: route,
            urlWithParams: aliasUrl,
        });

        expect(appliedMatch.pathWithAppliedParams).toEqual(expectedResult);
    });
});
