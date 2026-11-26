// This code is auto-generated and exports an routes array representing a real world use case for a complex route config
/* tslint:disable */
/* eslint-disable */
export const TEST_COMPLEX_ROUTE_CONFIG_2: any[] = [
    // ibas.views.home.welcome.route
    {
        title: 'Headers.HomeWelcome',
        path: '',
        data: { menuIdentifier: 'home/welcome', breadcrumb: { showAsHomeIcon: true } },
        redirectTo: `http://localhost:61630/#/`,
    },
    // ibas.views.home.content.contactRoute
    {
        title: 'Headers.Contact',
        path: 'contact',
        data: { menuIdentifier: 'home/contact', sideNav: { excludeFromMenu: true }, excludeFromMainMenu: true },
        redirectTo: `http://localhost:61630/#/contact`,
    },
    // ibas.views.home.content.imprintRoute
    {
        title: 'Headers.Imprint',
        path: 'imprint',
        data: { menuIdentifier: 'home/imprint', sideNav: { excludeFromMenu: true }, excludeFromMainMenu: true },
        redirectTo: `http://localhost:61630/#/imprint`,
    },
    // ibas.views.home.content.legalRoute
    {
        title: 'Headers.Legal',
        path: 'legal',
        data: { menuIdentifier: 'home/legal', sideNav: { excludeFromMenu: true }, excludeFromMainMenu: true },
        redirectTo: `http://localhost:61630/#/legal`,
    },
    {
        path: 'admin',
        title: 'Headers.Admin',
        data: { openInSidenav: true },
        children: [
            // ibas.views.admin.manageMasterData.route
            {
                path: 'manage-master-data',
                title: 'Headers.ManageMasterData',
                redirectTo: `http://localhost:61630/#/manageMasterData`,
                data: { menuIdentifier: 'admin/manageMasterData' },
            },
            // ibas.views.admin.users.list.route
            {
                path: 'users',
                title: 'Headers.UsersList',
                data: { menuIdentifier: 'users/list', link: { href: `http://localhost:61630/#/users` } },
                children: [
                    // ibas.views.admin.users.detail.createRoute
                    {
                        path: 'users/create',
                        title: 'Headers.UsersCreate',
                        redirectTo: `http://localhost:61630/#/users/create`,
                        data: { menuIdentifier: 'users/create', sideNav: { excludeFromMenu: true } },
                    },
                    // ibas.views.admin.users.detail.detailRoute
                    {
                        path: 'users/:id',
                        title: 'Headers.UsersDetail',
                        redirectTo: `http://localhost:61630/#/users/:id`,
                        data: { menuIdentifier: 'users/detail', sideNav: { excludeFromMenu: true } },
                    },
                ],
            },
            // ibas.views.documents.template.list.route
            {
                path: 'templates',
                title: 'Headers.Templates',
                redirectTo: `http://localhost:61630/#/templates`,
                data: { menuIdentifier: 'templates' },
            },
        ],
    },
    // ibas.views.dossiers.list.route
    {
        path: 'dossiers',
        title: 'Headers.DossiersList',
        data: {
            menuIdentifier: 'dossiers/list',
        },
        children: [
            {
                path: '',
                data: { sideNav: { excludeFromMenu: true } },
                children: [
                    { path: '', title: 'Headers.DossiersList', data: { sideNav: { excludeFromMenu: true } } },
                    // ibas.views.dossiers.detailCreate.route
                    {
                        path: 'createvibel',
                        title: 'Headers.DossiersCreateVibel',
                        // redirectTo: `http://localhost:61630/#/dossiers/create`,
                        data: { sideNav: { excludeFromMenu: true }, menuIdentifier: 'dossiers/createvibel' },
                    },
                    // ibas.views.dossiers.detailCreateIhp.route
                    {
                        path: 'createihp',
                        title: 'Headers.DossiersCreateIhp',
                        data: { sideNav: { excludeFromMenu: true }, menuIdentifier: 'dossiers/createihp' },
                    },
                ],
            },
        ],
    },
    // ibas.views.reporting.overview.route
    {
        path: 'reporting',
        title: 'Headers.Reporting',
        redirectTo: `http://localhost:61630/#/reporting`,
        data: {
            menuIdentifier: 'reporting',
        },
    },
    // ibas.views.invoices.organizationList.route
    {
        path: 'organization-invoices',
        title: 'Headers.OrganizationInvoicesList',
        data: {
            menuIdentifier: 'organizationInvoices/list',
            link: { href: `http://localhost:61630/#/organizationInvoices` },
        },
        children: [
            // ibas.views.invoices.detailCreate.organizationRoute
            {
                title: 'Headers.OrganizationInvoicesCreate',
                path: 'create',
                redirectTo: `http://localhost:61630/#/organizationInvoices/create`,
                data: { menuIdentifier: 'organizationInvoices/create', sideNav: { excludeFromMenu: true } },
            },
            // ibas.views.invoices.detailEdit.organizationRoute
            {
                title: 'Headers.OrganizationInvoicesDetail',
                path: ':id',
                redirectTo: `http://localhost:61630/#/organizationInvoices/:id`,
                data: { menuIdentifier: 'organizationInvoices/detail', sideNav: { excludeFromMenu: true } },
            },
        ],
    },
    {
        path: 'ihpserviceprovision',
        title: 'Headers.IhpServiceProvisionList',
        children: [
            {
                path: '',
                children: [
                    {
                        path: '',
                        title: 'Headers.IhpServiceProvisionList',
                        data: { sideNav: { excludeFromMenu: true } },
                    },
                ],
            },
        ],
        data: {
            menuIdentifier: 'ihpserviceprovision/list',
            redirectFromClassicRoute: `http://localhost:61630/#/ihpserviceprovision`,
        },
    },
    // ibas.views.issues.list.globalRoute
    {
        path: 'issues/global',
        title: 'Headers.IssuesListGlobal',
        redirectTo: `http://localhost:61630/#/issues/global`,
        data: {
            menuIdentifier: 'issues/list/global',
        },
    },
    {
        path: 'self-sign-up',
        title: 'Headers.SelfSignup',
        data: {
            menuIdentifier: 'selfSignUp',
            // link: { href: `http://localhost:61630/#/selfsignup` },
        },
        children: [
            { path: '' },
            // ibas.views.selfSignUp.infoIntroduction.route
            {
                path: 'info-introduction',
                title: 'Headers.SelfSignUpInfoIntroduction',
                data: {
                    menuIdentifier: 'selfSignUp/infoIntroduction',
                    sideNav: { excludeFromMenu: true },
                    breadcrumb: { excludeFromBreadcrumb: true },
                    redirectFromClassicRoute: 'selfsignup/infoIntroduction',
                },
            },
            {
                path: 'infoIntroduction',
                title: 'Headers.SelfSignUpInfoIntroduction',
                // redirectTo: `http://localhost:61630/#/selfsignup/infoIntroduction`, // TODO Redirect from classic (Everywhere in thsi file)
                redirectTo: 'info-introduction',
                data: {
                    menuIdentifier: 'selfSignUp/infoIntroduction',
                    sideNav: { excludeFromMenu: true },
                    breadcrumb: { excludeFromBreadcrumb: true },
                },
            },
            // ibas.views.selfSignUp.checklist.route
            {
                path: 'checklist',
                title: 'Headers.SelfSignUpChecklist',
                data: {
                    menuIdentifier: 'selfSignUp/checklist',
                    sideNav: { excludeFromMenu: true },
                    breadcrumb: { excludeFromBreadcrumb: true },
                    redirectFromClassicRoute: 'selfsignup/checklist',
                },
            },
            // ibas.views.selfSignUp.infoBeLogin.route
            {
                path: 'info-be-login',
                title: 'Headers.SelfSignUpInfoBeLogin',
                data: {
                    menuIdentifier: 'selfSignUp/infoBeLogin',
                    sideNav: { excludeFromMenu: true },
                    redirectFromClassicRoute: 'selfsignup/infoBeLogin',
                },
            },
            {
                path: 'infoBeLogin',
                title: 'Headers.SelfSignUpInfoBeLogin',
                // redirectTo: `http://localhost:61630/#/selfsignup/infoBeLogin`,
                redirectTo: 'info-be-login',
                data: { sideNav: { excludeFromMenu: true } },
            },
            // ibas.views.selfSignUp.userRole.route
            {
                path: 'user-role',
                title: 'Headers.SelfSignUpUserRole',
                data: {
                    menuIdentifier: 'selfSignUp/userRole',
                    sideNav: { excludeFromMenu: true },
                    breadcrumb: { excludeFromBreadcrumb: true },
                    redirectFromClassicRoute: 'selfsignup/userRole',
                },
            },
            {
                path: 'userRole',
                title: 'Headers.SelfSignUpUserRole',
                // redirectTo: `http://localhost:61630/#/selfsignup/userRole`,
                redirectTo: 'user-role',
                data: { sideNav: { excludeFromMenu: true }, breadcrumb: { excludeFromBreadcrumb: true } },
            },
            // ibas.views.selfSignUp.createMandate.createRoute
            {
                path: 'create-mandate',
                title: 'Headers.SelfSignUpCreateMandate',
                data: {
                    menuIdentifier: 'selfSignUp/createMandate',
                    sideNav: { excludeFromMenu: true },
                    redirectFromClassicRoute: 'selfsignup/createMandate',
                },
            },
            {
                path: 'createMandate',
                title: 'Headers.SelfSignUpCreateMandate',
                // redirectTo: `http://localhost:61630/#/selfsignup/createMandate`,
                redirectTo: 'create-mandate',
                data: { sideNav: { excludeFromMenu: true } },
            },
            // ibas.views.selfSignUp.createMandate.editRoute
            {
                path: 'create-mandate/:id',
                title: 'Headers.SelfSignUpCreateMandateEdit',
                data: {
                    menuIdentifier: 'selfSignUp/createMandateEdit',
                    sideNav: { excludeFromMenu: true },
                    redirectFromClassicRoute: 'selfsignup/createMandate/:id',
                },
            },
            {
                path: 'createMandate/:id',
                title: 'Headers.SelfSignUpCreateMandateEdit',
                // redirectTo: `http://localhost:61630/#/selfsignup/createMandate/:id`,
                redirectTo: 'create-mandate/:id',
                data: { sideNav: { excludeFromMenu: true } },
            },
            // ibas.views.selfSignUp.infoExistingMandates.route
            {
                path: 'info-existing-mandates',
                title: 'Headers.SelfSignUpInfoExistingMandates',
                data: {
                    menuIdentifier: 'selfSignUp/infoExistingMandates',
                    sideNav: { excludeFromMenu: true },
                    redirectFromClassicRoute: 'selfsignup/infoExistingMandates',
                },
            },
            {
                path: 'infoExistingMandates',
                title: 'Headers.SelfSignUpInfoExistingMandates',
                // redirectTo: `http://localhost:61630/#/selfsignup/infoExistingMandates`,
                redirectTo: 'info-existing-mandates',
                data: { sideNav: { excludeFromMenu: true } },
            },
            // ibas.views.selfSignUp.infoLogin.route
            {
                path: 'info-login',
                title: 'Headers.SelfSignUpInfoLogin',
                data: {
                    menuIdentifier: 'selfSignUp/infoLogin',
                    sideNav: { excludeFromMenu: true },
                    redirectFromClassicRoute: 'selfsignup/infoLogin',
                },
            },
            {
                path: 'infoLogin',
                title: 'Headers.SelfSignUpInfoLogin',
                // redirectTo: `http://localhost:61630/#/selfsignup/infoLogin`,
                redirectTo: 'info-login',
                data: { sideNav: { excludeFromMenu: true } },
            },
            // ibas.views.selfSignUp.detail.route
            {
                path: 'detail',
                title: 'Headers.SelfSignup',
                data: {
                    menuIdentifier: 'selfSignUp/detail',
                    canConditionallyMoveToMainMenu: true,
                    redirectFromClassicRoute: 'selfsignup/detail',
                },
            },
        ],
    },
    {
        path: 'selfsignup',
        redirectTo: 'self-sign-up',
    },
    // ibas.views.ihpAssessment.list.route
    {
        path: 'ihp-assessments',
        title: 'Headers.IhpAssessmentsList',
        data: {
            menuIdentifier: 'ihpAssessments/list',
        },
        children: [
            {
                path: '',
                data: { sideNav: { excludeFromMenu: true } },
                children: [{ path: '', title: 'Headers.IhpAssessmentsList', data: {} }],
            },
        ],
    },
    // Internal redirects (for comfort)
    {
        path: 'ihp-service-provider',
        redirectTo: 'current-mandate/ihp-service-consumption/ihp-service-provider',
    },
    {
        path: 'ihp-clearing',
        redirectTo: 'current-mandate/ihp-service-consumption/ihp-clearing',
    },
    {
        path: 'assessments',
        redirectTo: 'current-mandate/personal-data/assessments',
    },
    {
        path: 'ihpassessments',
        redirectTo: 'ihp-assessments',
    },
    {
        path: 'ihpAssessments',
        redirectTo: 'ihp-assessments',
    },
    {
        path: 'ihpassessments/:id',
        redirectTo: 'current-mandate/ihp-assessments/:id',
    },
    {
        path: 'ihpAssessments/:id',
        redirectTo: 'current-mandate/ihp-assessments/:id',
    },
    // {
    //     path: 'minimaldata',
    //     redirectTo: 'current-mandate/minimal-data',
    // },
    // {
    //     path: 'minimaldatavibel',
    //     redirectTo: 'current-mandate/minimal-data-vibel',
    // },
    // current mandate
    {
        path: 'current-mandate',
        title: '{{virtualMandate}}',
        data: {
            openInSidenav: true,
            menuIdentifier: 'current-mandate',
            displayOrder: 99,
        },
        children: [
            // ibas.views.dashboard.dashboard.route
            {
                title: 'Headers.Dashboard',
                path: 'dashboard',
                redirectTo: `http://localhost:61630/#/dashboard`,
                data: { menuIdentifier: 'dashboard', canConditionallyMoveToMainMenu: true },
            },
            // ibas.views.index.personalDataRoute
            {
                path: 'personal-data',
                title: 'Headers.PersonalDataMenuItem',
                data: {
                    openInSidenav: true,
                    menuIdentifier: 'PersonalDataMenuItem',
                    canConditionallyMoveToMainMenu: true,
                },
                children: [
                    // ibas.views.dossiers.detailEdit.route
                    {
                        title: 'Headers.DossiersDetail',
                        path: 'dossier',
                        children: [
                            // ibas.views.dossiers.detailEdit.route
                            {
                                title: '{{resolveResult.title}}',
                                path: '',
                                data: { sideNav: { excludeFromMenu: true } },
                            },
                        ],
                        data: {
                            redirectFromClassicRoute: '/dossier',
                            menuIdentifier: 'dossiers/detail',
                            canConditionallyMoveToMainMenu: true,
                        },
                    },
                    // ibas.views.dossiers.history.route
                    {
                        title: 'Headers.DossiersHistory',
                        path: 'history',
                        redirectTo: `http://localhost:61630/#/history`,
                        data: { menuIdentifier: 'dossiers/history', canConditionallyMoveToMainMenu: true },
                    },
                    // ibas.views.representations.list.route
                    {
                        title: 'Headers.Representations',
                        path: 'representations',
                        data: {
                            menuIdentifier: 'representations/list',
                            canConditionallyMoveToMainMenu: true,
                            link: { href: `http://localhost:61630/#/representations` },
                        },
                        children: [
                            // ibas.views.representations.detail.createRoute
                            {
                                title: 'Headers.RepresentationsCreate',
                                path: 'create',
                                redirectTo: `http://localhost:61630/#/representations/create`,
                                data: { menuIdentifier: 'representations/create', sideNav: { excludeFromMenu: true } },
                            },
                            // ibas.views.representations.detail.detailRoute
                            {
                                title: 'Headers.RepresentationsDetail',
                                path: ':id',
                                redirectTo: `http://localhost:61630/#/representations/:id`,
                                data: {
                                    menuIdentifier: 'representations/detail',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.representations.detail.detailUserRoute
                            {
                                title: 'Headers.User',
                                path: ':id/user',
                                redirectTo: `http://localhost:61630/#/representations/:id/user`,
                                data: {
                                    menuIdentifier: 'representations/detail/user',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                        ],
                    },
                    // ibas.views.ihpAssessment.detail.route
                    {
                        path: 'ihp-assessments',
                        title: 'Headers.IhpAssessmentsList',
                        data: {
                            sideNav: {
                                excludeFromMenu: true,
                            },
                            link: {
                                href: 'http://localhost:61630/#/ihpAssessments',
                            },
                        },
                        children: [
                            {
                                title: '{{resolveResult.title}}',
                                path: ':id',
                                data: { sideNav: { excludeFromMenu: true } },
                                children: [
                                    // ibas.views.ihpAssessment.detail.route
                                    {
                                        path: '',
                                        title: 'Headers.IhpAssessmentsDetail',
                                        data: {
                                            sideNav: { excludeFromMenu: true },
                                            menuIdentifier: 'ihpAssessments/detail',
                                        },
                                    },
                                    // ibas.views.ihpAssessment.instrument.detail.route
                                    {
                                        title: 'Headers.IhpAssessmentsDetailInstrument',
                                        path: 'instrument',
                                        data: {
                                            menuIdentifier: 'ihpAssessments/detail/instrument',
                                            sideNav: { excludeFromMenu: true },
                                        },
                                        redirectTo: `http://localhost:61630/#/ihpAssessments/:id/instrument/`,
                                    },
                                    // ibas.views.ihpAssessment.detail.ihpAssessmentDispositionsListRoute
                                    {
                                        title: 'Headers.Disposition',
                                        path: 'dispositions/list',
                                        data: {
                                            menuIdentifier: 'ihpAssessments/detail/dispositions/list',
                                            sideNav: { excludeFromMenu: true },
                                            redirectFromClassicRoute: '/ihpAssessments/:id/dispositions/list',
                                        },
                                    },
                                    // ibas.views.ihpAssessment.instrument.detail.instrument.route
                                    {
                                        title: 'Headers.IhpAssessmentsDetailInstrumentDetailInstrument',
                                        path: 'instrument/:navItemId',
                                        data: {
                                            menuIdentifier: 'ihpAssessments/detail/instrument.detail/instrument',
                                            sideNav: { excludeFromMenu: true },
                                            link: {
                                                href: `http://localhost:61630/#/ihpAssessments/:id/instrument/:navItemId`,
                                            },
                                        },
                                        children: [
                                            // ibas.views.ihpAssessment.instrument.detail.goal.route
                                            {
                                                title: 'Headers.IhpAssessmentsDetailInstrumentDetailGoal',
                                                path: 'goal/:goalId',
                                                redirectTo: `http://localhost:61630/#/ihpAssessments/:id/instrument/:navItemId/goal/:goalId`,
                                                data: {
                                                    menuIdentifier: 'ihpAssessments/detail/instrument.detail/goal',
                                                    sideNav: { excludeFromMenu: true },
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    // ibas.views.assessment.list.route
                    {
                        title: 'Headers.AssessmentsList',
                        path: 'assessments',
                        data: {
                            menuIdentifier: 'assessments/list',
                            link: { href: `http://localhost:61630/#/assessments` },
                            canConditionallyMoveToMainMenu: true,
                        },
                        children: [
                            // ibas.views.assessment.detail.route
                            {
                                title: 'Headers.AssessmentsDetail',
                                path: ':id',
                                data: {
                                    menuIdentifier: 'assessments/detail',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/assessments/:id`,
                            },
                        ],
                    },
                    {
                        title: 'Headers.WorkList',
                        path: 'work',
                        redirectTo: `http://localhost:61630/#/work`,
                        data: { menuIdentifier: 'work/list', canConditionallyMoveToMainMenu: true },
                    },
                ],
            },
            // ibas.views.index.ihpServiceConsumptionRoute
            {
                path: 'ihp-service-consumption',
                title: 'Headers.IhpServiceConsumptionMenuItem',
                data: {
                    openInSidenav: true,
                    menuIdentifier: 'IhpServiceConsumptionMenuItem',
                    canConditionallyMoveToMainMenu: true,
                },
                children: [
                    {
                        title: 'Headers.IhpClearingsOverview',
                        path: 'ihp-clearing',
                        data: {
                            redirectFromClassicRoute: '/ihpclearings',
                            menuIdentifier: 'ihpclearings/overview',
                        },
                        children: [
                            {
                                path: '',
                                data: { sideNav: { excludeFromMenu: true } },
                                children: [
                                    {
                                        path: '',
                                        title: 'Headers.IhpClearingsOverview',
                                        data: { sideNav: { excludeFromMenu: true } },
                                    },
                                    {
                                        path: 'month/:id',
                                        title: '{{resolveResult.title}}',
                                        data: {
                                            redirectFromClassicRoute: '/ihpclearings/month/:id',
                                            sideNav: { excludeFromMenu: true },
                                        },
                                        children: [
                                            {
                                                path: '',
                                                title: '{{resolveResult.title}}',
                                                data: {
                                                    sideNav: { excludeFromMenu: true },
                                                    breadcrumb: { excludeFromBreadcrumb: true },
                                                },
                                            },
                                            {
                                                path: 'salary-payment-continuation-case/:salaryPaymentContinuationCaseId',
                                                title: '{{childResolveResult.title}}',
                                                data: { sideNav: { excludeFromMenu: true } },
                                            },
                                        ],
                                    },
                                    // ibas.views.ihpClearings.ihpClearingDetail.route
                                    {
                                        path: ':id',
                                        title: '{{resolveResult.title}}',
                                        data: {
                                            menuIdentifier: 'ihpclearings/overview/detail',
                                            sideNav: { excludeFromMenu: true },
                                            redirectFromClassicRoute: `http://localhost:61630/#/ihpclearings/:id`,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
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
                                            redirectFromClassicRoute: '/ihpserviceproviders/:id',
                                        },
                                        title: '{{resolveResult.title}}',
                                        children: [
                                            {
                                                path: '',
                                                data: {
                                                    sideNav: { excludeFromMenu: true },
                                                    breadcrumb: { excludeFromBreadcrumb: true },
                                                },
                                                title: '{{resolveResult.title}}',
                                            },
                                            {
                                                path: 'history-data/:historyDataId',
                                                data: { sideNav: { excludeFromMenu: true } },
                                                title: '{{childResolveResult.title}}',
                                            },
                                        ],
                                    },
                                    {
                                        path: 'detail-day-care-center/:id',
                                        data: {
                                            sideNav: { excludeFromMenu: true },
                                            redirectFromClassicRoute: '/ihpserviceproviders/daycarecenter/:id',
                                        },
                                        title: '{{resolveResult.title}}',
                                        children: [
                                            {
                                                path: '',
                                                data: {
                                                    sideNav: { excludeFromMenu: true },
                                                    breadcrumb: { excludeFromBreadcrumb: true },
                                                },
                                                title: 'Headers.IhpDayCareCenter',
                                            },
                                            {
                                                path: 'history-data/:historyDataId',
                                                data: { sideNav: { excludeFromMenu: true } },
                                                title: '{{childResolveResult.title}}',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // ibas.views.ihpProposal.info.route
            {
                title: 'Headers.IhpProposalInfo',
                path: 'ihp-proposal/info',
                redirectTo: `http://localhost:61630/#/ihpproposal`,
                data: { menuIdentifier: 'ihpProposal/info', canConditionallyMoveToMainMenu: true },
            },
            // ibas.views.ihpFundingSources.list.route
            {
                title: 'Headers.IhpFundingSourcesList',
                path: 'ihpfundingsources',
                data: {
                    menuIdentifier: 'ihpfundingsources/list',
                    canConditionallyMoveToMainMenu: true,
                    redirectFromClassicRoute: 'http://localhost:61630/#/ihpfundingsources',
                },
                children: [
                    {
                        path: '',
                        children: [
                            // ibas.views.ihpFundingSources.detail.additionalDetailRoute
                            {
                                path: 'additional',
                                data: { sideNav: { excludeFromMenu: true } },
                                children: [
                                    {
                                        path: 'detail',
                                        title: 'Headers.IhpAdditionalFundingSource',
                                        data: {
                                            sideNav: { excludeFromMenu: true },
                                            redirectFromClassicRoute: '/ihpfundingsources/additional/detail',
                                        },
                                        children: [
                                            { path: '', data: { sideNav: { excludeFromMenu: true } } },
                                            {
                                                path: ':id',
                                                title: '{{resolveResult.title}}',
                                                data: { sideNav: { excludeFromMenu: true } },
                                            },
                                        ],
                                    },
                                ],
                            },
                            { path: '', data: { sideNav: { excludeFromMenu: true } } },
                            {
                                path: ':id',
                                data: {
                                    menuIdentifier: 'ihpfundingsources/detail',
                                    sideNav: { excludeFromMenu: true },
                                    redirectFromClassicRoute: `http://localhost:61630/#/ihpfundingsources/:id`,
                                },
                                title: '{{resolveResult.title}}',
                                children: [
                                    { path: '', data: { sideNav: { excludeFromMenu: true } } },
                                    // ibas.views.ihpFundingSources.historyData.historyDataDetail.createRoute
                                    {
                                        title: '{{resolveResultHistoryData.title}}',
                                        path: 'historydata/create',
                                        data: {
                                            menuIdentifier: 'ihpfundingsources/historydata/create',
                                            sideNav: { excludeFromMenu: true },
                                            redirectFromClassicRoute: `http://localhost:61630/#/ihpfundingsources/:id/historydata/create`,
                                        },
                                    },
                                    // ibas.views.ihpFundingSources.historyData.historyDataDetail.editRoute
                                    {
                                        title: '{{resolveResultHistoryData.title}}',
                                        path: 'historydata/edit/:historyDataId',
                                        data: {
                                            menuIdentifier: 'ihpfundingsources/historydata/edit',
                                            sideNav: { excludeFromMenu: true },
                                            redirectFromClassicRoute: `http://localhost:61630/#/ihpfundingsources/historydata/edit/:historyDataId`,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // ibas.views.minimalData.wizard.vibelRoute
            {
                title: 'Headers.MinimalDataWizardVibel',
                path: 'minimal-data-vibel',
                data: {
                    menuIdentifier: 'minimalData/wizardVibel',
                    //
                    // link: { href: `http://localhost:61630/#/minimaldatavibel` },
                    // subChildrenAliasUrls: ['/minimaldatavibel/*'],
                    canConditionallyMoveToMainMenu: true,
                },
                children: [
                    {
                        path: '',
                        children: [
                            // ibas.views.minimalData.representationDetail.createProposalVibelRoute
                            {
                                title: 'Headers.MinimalDataRepresentationCreateVibel',
                                path: 'createrepresentation',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/createrepresentation`,
                                data: {
                                    menuIdentifier: 'minimalData/representationCreateVibel',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.representationDetail.detailProposalVibelRoute
                            {
                                title: 'Headers.MinimalDataRepresentationDetailProposalVibel',
                                path: 'representationproposal/:id',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/representationproposal/:id`,
                                data: {
                                    menuIdentifier: 'minimalData/representationDetailProposalVibel',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.representationDetail.detailMandateVibelRoute
                            {
                                title: 'Headers.MinimalDataRepresentationDetailMandateVibel',
                                path: 'representationmandate/:id',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/representationmandate/:id`,
                                data: {
                                    menuIdentifier: 'minimalData/representationDetailMandateVibel',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.fundingSourceHistoryDataDetail.createVibelRoute
                            {
                                title: 'Headers.FundingSourcesDetail',
                                path: 'fundingsourcehistorydata/create/:fundingSourceId',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/fundingsourcehistorydata/create/:fundingSourceId`,
                                data: {
                                    menuIdentifier: 'minimalData/vibelfundingsourcehistorydata/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.fundingSourceHistoryDataDetail.detailVibelRoute
                            {
                                title: 'Headers.FundingSourcesDetail',
                                path: 'fundingsourcehistorydata/edit/:id',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/fundingsourcehistorydata/edit/:id`,
                                data: {
                                    menuIdentifier: 'minimalData/vibelfundingsourcehistorydata/edit',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step1PersonalData.vibelRoute
                            {
                                title: 'Headers.MinimalDataStep1',
                                path: 'step1',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/step1`,
                                data: {
                                    menuIdentifier: 'minimalData/wizardVibel.step1PersonalData',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step2Address.vibelRoute
                            {
                                title: 'Headers.MinimalDataStep2',
                                path: 'step2',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/step2`,
                                data: {
                                    menuIdentifier: 'minimalData/wizardVibel.step2Address',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step3Representations.vibelRoute
                            {
                                title: 'Headers.MinimalDataStep3',
                                path: 'step3',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/step3`,
                                data: {
                                    menuIdentifier: 'minimalData/wizardVibel.step3Representations',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step4HousingSituation.vibelRoute
                            {
                                title: 'Headers.MinimalDataStep4',
                                path: 'step4',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/step4`,
                                data: {
                                    menuIdentifier: 'minimalData/wizardVibel.step4HousingSituation',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step5FundingSources.vibelRoute
                            {
                                title: 'Headers.MinimalDataStep5',
                                path: 'step5',
                                data: {
                                    menuIdentifier: 'minimalData/wizardVibel.step5FundingSources',
                                    sideNav: { excludeFromMenu: true },
                                    link: { href: `http://localhost:61630/#/minimaldatavibel/step5` },
                                },
                                children: [
                                    // ibas.views.minimalData.wizard.step5FundingSources.additionalDetailVibelRoute
                                    {
                                        path: 'additional',
                                        data: { sideNav: { excludeFromMenu: true } },
                                        children: [
                                            {
                                                path: 'detail/:id',
                                                title: '{{resolveResult.title}}',
                                                data: {
                                                    sideNav: { excludeFromMenu: true },
                                                    redirectFromClassicRoute:
                                                        '/minimaldatavibel/step5/additional/detail/:id',
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            // ibas.views.minimalData.wizard.step6Summary.vibelRoute
                            {
                                title: 'Headers.MinimalDataStep6',
                                path: 'step6',
                                redirectTo: `http://localhost:61630/#/minimaldatavibel/step6`,
                                data: {
                                    menuIdentifier: 'minimalData/wizardVibel.step6Summary',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                        ],
                    },
                ],
            },
            // ibas.views.minimalData.wizard.route
            {
                path: 'minimal-data',
                data: {
                    canConditionallyMoveToMainMenu: true,
                },
                children: [
                    {
                        path: '',
                        title: 'Headers.MinimalDataWizard',
                        data: { menuIdentifier: 'minimalData/wizard' },
                        children: [
                            // ibas.views.minimalData.representationDetail.createProposalRoute
                            {
                                title: 'Headers.MinimalDataRepresentationCreate',
                                path: 'createrepresentation',
                                redirectTo: `http://localhost:61630/#/minimaldata/createrepresentation`,
                                data: {
                                    menuIdentifier: 'minimalData/representationCreate',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.representationDetail.detailProposalRoute
                            {
                                title: 'Headers.MinimalDataRepresentationDetailProposal',
                                path: 'representationproposal/:id',
                                redirectTo: `http://localhost:61630/#/minimaldata/representationproposal/:id`,
                                data: {
                                    menuIdentifier: 'minimalData/representationDetailProposal',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.representationDetail.detailMandateRoute
                            {
                                title: 'Headers.MinimalDataRepresentationDetailMandate',
                                path: 'representationmandate/:id',
                                redirectTo: `http://localhost:61630/#/minimaldata/representationmandate/:id`,
                                data: {
                                    menuIdentifier: 'minimalData/representationDetailMandate',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.fundingSourceHistoryDataDetail.createRoute
                            {
                                title: 'Headers.FundingSourcesDetail',
                                path: 'fundingsourcehistorydata/create/:fundingSourceId',
                                redirectTo: `http://localhost:61630/#/minimaldata/fundingsourcehistorydata/create/:fundingSourceId`,
                                data: {
                                    menuIdentifier: 'minimalData/fundingsourcehistorydata/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.fundingSourceHistoryDataDetail.detailRoute
                            {
                                title: 'Headers.FundingSourcesDetail',
                                path: 'fundingsourcehistorydata/edit/:id',
                                redirectTo: `http://localhost:61630/#/minimaldata/fundingsourcehistorydata/edit/:id`,
                                data: {
                                    menuIdentifier: 'minimalData/fundingsourcehistorydata/edit',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step1PersonalData.route
                            {
                                title: 'Headers.MinimalDataStep1',
                                path: 'step1',
                                data: {
                                    menuIdentifier: 'minimalData/wizard.step1PersonalData',
                                    redirectFromClassicRoute: '/minimaldata/step1',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step2Address.route
                            {
                                title: 'Headers.MinimalDataStep2',
                                path: 'step2',
                                redirectTo: `http://localhost:61630/#/minimaldata/step2`,
                                data: {
                                    menuIdentifier: 'minimalData/wizard.step2Address',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step3Representations.route
                            {
                                title: 'Headers.MinimalDataStep3',
                                path: 'step3',
                                redirectTo: `http://localhost:61630/#/minimaldata/step3`,
                                data: {
                                    menuIdentifier: 'minimalData/wizard.step3Representations',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step4HousingSituation.route
                            {
                                title: 'Headers.MinimalDataStep4',
                                path: 'step4',
                                redirectTo: `http://localhost:61630/#/minimaldata/step4`,
                                data: {
                                    menuIdentifier: 'minimalData/wizard.step4HousingSituation',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.minimalData.wizard.step5FundingSources.route
                            {
                                title: 'Headers.MinimalDataStep5',
                                path: 'step5',
                                data: {
                                    menuIdentifier: 'minimalData/wizard.step5FundingSources',
                                    sideNav: { excludeFromMenu: true },
                                    link: { href: `http://localhost:61630/#/minimaldata/step5` },
                                },
                                children: [
                                    // ibas.views.minimalData.wizard.step5FundingSources.additionalDetailRoute
                                    {
                                        path: 'additional',
                                        data: { sideNav: { excludeFromMenu: true } },
                                        children: [
                                            {
                                                path: 'detail/:id',
                                                title: '{{resolveResult.title}}',
                                                data: {
                                                    sideNav: { excludeFromMenu: true },
                                                    redirectFromClassicRoute:
                                                        '/minimaldata/step5/additional/detail/:id',
                                                },
                                            },
                                        ],
                                    },
                                ],
                            },
                            // ibas.views.minimalData.wizard.step6Summary.route
                            {
                                title: 'Headers.MinimalDataStep6',
                                path: 'step6',
                                redirectTo: `http://localhost:61630/#/minimaldata/step6`,
                                data: {
                                    menuIdentifier: 'minimalData/wizard.step6Summary',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                        ],
                    },
                ],
            },
            // ibas.views.index.inboxAndArchiveRoute
            {
                title: 'Headers.InboxAndArchiveMenuItem',
                path: 'inbox-and-archive',
                data: {
                    openInSidenav: true,
                    canConditionallyMoveToMainMenu: true,
                    menuIdentifier: 'InboxAndArchiveMenuItem',
                },
                children: [
                    // ibas.views.issues.list.dossierRoute
                    {
                        title: 'Headers.IssuesListDossier',
                        path: 'issues/dossier',
                        redirectTo: `http://localhost:61630/#/issues/dossier`,
                        data: { menuIdentifier: 'issues/list/dossier' },
                    },
                    // ibas.views.documents.dossierDocument.list.route
                    {
                        title: 'Headers.DossiersDocuments',
                        path: 'dossiers/documents',
                        redirectTo: `http://localhost:61630/#/documents`,
                        data: { menuIdentifier: 'dossiers/documents' },
                    },
                ],
            },
            // ibas.views.index.setUpProfileRoute
            {
                path: 'set-up-profile',
                title: 'Headers.SetUpProfileMenuItem',
                data: {
                    menuIdentifier: 'SetUpProfileMenuItem',
                    canConditionallyMoveToMainMenu: true,
                    openInSidenav: true,
                },
                children: [
                    {
                        title: 'Headers.WorkList',
                        path: 'work',
                        data: {
                            menuIdentifier: 'work/list',
                            canConditionallyMoveToMainMenu: true,
                            link: { href: `http://localhost:61630/#/work` },
                        },
                        children: [
                            // ibas.views.work.detail.createRoute
                            {
                                title: 'Headers.WorkCreate',
                                path: 'create',
                                data: {
                                    menuIdentifier: 'work/create',
                                    canConditionallyMoveToMainMenu: true,
                                },
                                redirectTo: `http://localhost:61630/#/work/create`,
                            },
                            // ibas.views.work.detail.detailRoute
                            {
                                title: 'Headers.WorkDetail',
                                path: ':id',
                                data: {
                                    menuIdentifier: 'work/detail',
                                    canConditionallyMoveToMainMenu: true,
                                },
                                redirectTo: `http://localhost:61630/#/work/:id`,
                            },
                        ],
                    },
                    // ibas.views.fundingSources.list.route
                    {
                        title: 'Headers.FundingSourcesList',
                        path: 'fundingsources',
                        data: {
                            menuIdentifier: 'fundingsources/list',
                            link: { href: `http://localhost:61630/#/fundingsources` },
                        },
                        children: [
                            // ibas.views.fundingSources.detail.createRoute
                            {
                                title: 'Headers.FundingSourcesCreate',
                                path: 'create/:typeId',
                                redirectTo: `http://localhost:61630/#/fundingsources/create/:typeId`,
                                data: {
                                    menuIdentifier: 'fundingsources/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.fundingSources.detail.detailRoute
                            {
                                title: 'Headers.FundingSourcesDetail',
                                path: ':id',
                                redirectTo: `http://localhost:61630/#/fundingsources/:id`,
                                data: {
                                    menuIdentifier: 'fundingsources/detail',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                        ],
                    },
                    // ibas.views.customServiceProviders.list.route
                    {
                        title: 'Headers.CustomServiceProvidersList',
                        path: 'customserviceproviders',
                        data: {
                            menuIdentifier: 'customserviceproviders/list',
                            link: { href: `http://localhost:61630/#/customserviceproviders` },
                        },
                        children: [
                            // ibas.views.customServiceProviders.detail.createAssistancePersonRoute
                            {
                                title: 'Headers.CustomServiceProvidersTypesAssistancePersonCreate',
                                path: 'assistancePerson/create',
                                data: {
                                    menuIdentifier: 'customserviceproviders/assistancePerson/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/customserviceproviders/assistancePerson/create`,
                            },
                            // ibas.views.customServiceProviders.detail.createServiceAgentRoute
                            {
                                title: 'Headers.CustomServiceProvidersCreateServiceAgent',
                                path: 'serviceAgent/create',
                                data: {
                                    menuIdentifier: 'customserviceproviders/serviceAgent/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/customserviceproviders/serviceAgent/create`,
                            },
                            // ibas.views.customServiceProviders.detail.createSocialInsurancenRoute
                            {
                                title: 'Headers.CustomServiceProvidersCreateCreateSocialInsurance',
                                path: 'socialInsurance/create',
                                data: {
                                    menuIdentifier: 'customserviceproviders/socialInsurance/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/customserviceproviders/socialInsurance/create`,
                            },
                            // ibas.views.customServiceProviders.detail.detailRoute
                            {
                                title: 'Headers.Details',
                                path: ':id',
                                data: {
                                    menuIdentifier: 'customserviceproviders/detail',
                                    sideNav: { excludeFromMenu: true },
                                    link: { href: `http://localhost:61630/#/customserviceproviders/:id` },
                                },
                                children: [
                                    // ibas.views.customServiceProviders.types.assistancePersonHistoryDataDetail.createRoute
                                    {
                                        title: 'Headers.CustomServiceProvidersTypesAssistancePersonHistoryDataCreate',
                                        path: 'assistanceperson/create',
                                        data: {
                                            menuIdentifier:
                                                'customserviceproviders/types/assistancePersonHistoryDataCreate',
                                            sideNav: { excludeFromMenu: true },
                                        },
                                        redirectTo: `http://localhost:61630/#/customserviceproviders/assistanceperson/:id/create`,
                                    },
                                    // ibas.views.customServiceProviders.types.assistancePersonHistoryDataDetail.detailRoute
                                    {
                                        title: 'Headers.CustomServiceProvidersTypesAssistancePersonHistoryDataDetail',
                                        path: 'assistanceperson/:historyDataId',
                                        data: {
                                            menuIdentifier:
                                                'customserviceproviders/types/assistancePersonHistoryDataDetail',
                                            sideNav: { excludeFromMenu: true },
                                        },
                                        redirectTo: `http://localhost:61630/#/customserviceproviders/assistanceperson/:id/:historyDataId`,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // ibas.views.index.clearingAreaRoute
            {
                path: 'clearing-area',
                title: 'Headers.ClearingAreaMenuItem',
                data: {
                    menuIdentifier: 'ClearingAreaMenuItem',
                    canConditionallyMoveToMainMenu: true,
                    openInSidenav: true,
                },
                children: [
                    // ibas.views.invoices.list.route
                    {
                        title: 'Headers.InvoicesList',
                        path: 'invoices',
                        data: { menuIdentifier: 'invoices/list', link: { href: `http://localhost:61630/#/invoices` } },
                        children: [
                            // ibas.views.invoices.detailCreate.defaultRoute
                            {
                                title: 'Headers.InvoicesCreate',
                                path: 'create/:serviceProviderId',
                                redirectTo: `http://localhost:61630/#/invoices/create?serviceProviderId=:serviceProviderId`,
                                data: { menuIdentifier: 'invoices/create', sideNav: { excludeFromMenu: true } },
                            },
                            // ibas.views.invoices.detailCreate.assistancePeopleRoute
                            {
                                title: 'Headers.AssistancePeopleInvoicesCreate',
                                path: 'assistancePeopleInvoices/create',
                                redirectTo: `http://localhost:61630/#/assistancePeopleInvoices/create`,
                                data: {
                                    menuIdentifier: 'assistancePeopleInvoices/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                            },
                            // ibas.views.invoices.detailEdit.defaultRoute
                            {
                                title: 'Headers.InvoicesDetail',
                                path: 'invoices/:id',
                                redirectTo: `http://localhost:61630/#/invoices/:id`,
                                data: { menuIdentifier: 'invoices/detail', sideNav: { excludeFromMenu: true } },
                            },
                        ],
                    },
                    // ibas.views.fundingSourcesRevenue.list.route
                    {
                        title: 'Headers.FundingSourcesRevenueList',
                        path: 'fundingsourcesrevenue',
                        data: {
                            menuIdentifier: 'fundingsourcesrevenue/list',
                            link: { href: `http://localhost:61630/#/fundingsourcesrevenue` },
                        },
                        children: [
                            // ibas.views.fundingSourcesRevenue.assistanceAmountDetail.createRoute
                            {
                                title: 'Headers.FundingSourcesRevenueAssistanceAmountRevenueDetail',
                                path: 'assistanceamountrevenue/create',
                                data: {
                                    menuIdentifier: 'fundingsourcesrevenue/assistanceamountrevenue/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/fundingsourcesrevenue/assistanceamountrevenue/create`,
                            },
                            // ibas.views.fundingSourcesRevenue.assistanceAmountDetail.detailRoute
                            {
                                title: 'Headers.FundingSourcesRevenueAssistanceAmountRevenueDetail',
                                path: 'assistanceamountrevenue/:id',
                                data: {
                                    menuIdentifier: 'fundingsourcesrevenue/assistanceamountrevenue/detail',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/fundingsourcesrevenue/assistanceamountrevenue/:id`,
                            },
                            // ibas.views.fundingSourcesRevenue.supplementaryServicesDetailCreate.createRoute
                            {
                                title: 'Headers.FundingSourcesRevenueSupplementaryServicesRevenueDetail',
                                path: 'supplementaryservicesrevenue/create',
                                data: {
                                    menuIdentifier: 'fundingsourcesrevenue/supplementaryservicesrevenue/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/fundingsourcesrevenue/supplementaryservicesrevenue/create`,
                            },
                            // ibas.views.fundingSourcesRevenue.supplementaryServicesDetailEdit.detailRoute
                            {
                                title: 'Headers.FundingSourcesRevenueSupplementaryServicesRevenueDetail',
                                path: 'supplementaryservicesrevenue/:id',
                                data: {
                                    menuIdentifier: 'fundingsourcesrevenue/supplementaryservicesrevenue/detail',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/fundingsourcesrevenue/supplementaryservicesrevenue/:id`,
                            },
                            // ibas.views.fundingSourcesRevenue.supplementaryServicesReport.route
                            {
                                title: 'Headers.FundingSourcesRevenueSupplementaryServicesReport',
                                path: 'supplementaryservices/report',
                                data: {
                                    menuIdentifier: 'fundingsourcesrevenue/supplementaryservices/report',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/fundingsourcesrevenue/supplementaryservices/report`,
                            },
                        ],
                    },
                    {
                        title: 'Headers.FundingSourcesRevenueSupplementaryServicesReport',
                        path: 'fundingsourcesrevenue/supplementaryservices/report',
                        redirectTo: `http://localhost:61630/#/fundingsourcesrevenue/supplementaryservices/report`,
                        data: { menuIdentifier: 'fundingsourcesrevenue/supplementaryservices/report' },
                    },
                    // ibas.views.clearings.cockpit.route
                    {
                        title: 'Headers.Cockpit',
                        path: 'cockpit',
                        redirectTo: `http://localhost:61630/#/cockpit`,
                        data: { menuIdentifier: 'clearings/cockpit' },
                    },
                    // ibas.views.clearings.list.route
                    {
                        title: 'Headers.ClearingsList',
                        path: 'clearings',
                        data: {
                            menuIdentifier: 'clearings/list',
                            link: { href: `http://localhost:61630/#/clearings` },
                        },
                        children: [
                            // ibas.views.clearings.detail.createRoute
                            {
                                title: 'Headers.ClearingsCreate',
                                path: 'create/:date',
                                data: {
                                    menuIdentifier: 'clearings/create',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/clearings/create/:date`,
                            },
                            // ibas.views.clearings.detail.createFinalRoute
                            {
                                title: 'Headers.ClearingsCreateFinal',
                                path: 'create/createfinal/:date',
                                data: {
                                    menuIdentifier: 'clearings/createfinal',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/clearings/createfinal/:date`,
                            },
                            // ibas.views.clearings.detail.detailRoute
                            {
                                title: 'Headers.ClearingsDetail',
                                path: 'create/:id',
                                data: {
                                    menuIdentifier: 'clearings/detail',
                                    sideNav: { excludeFromMenu: true },
                                },
                                redirectTo: `http://localhost:61630/#/clearings/:id`,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
