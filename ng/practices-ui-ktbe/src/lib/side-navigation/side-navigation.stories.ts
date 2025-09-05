import { Route } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeHeaderLogoComponent } from '../header/header-logo.component';
import { PuibeSideNavigationItemComponent } from './item/side-navigation-item.component';
import { PuibeSideNavigationPaneComponent } from './pane/side-navigation-pane.component';
import { PuibeSideNavigationComponent } from './side-navigation.component';
import { PuibeFooterComponent } from '../footer/footer.component';
import { PuibeFooterMenuItemDirective } from '../footer/footer-menu-item.directive';
import { PuibeFooterCopyrightDirective } from '../footer/footer-copyright.directive';

type Args = {};

const meta: Meta<Args> = {
    title: 'PUIBE/side-navigation',
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [
                PuibeSideNavigationComponent,
                PuibeSideNavigationPaneComponent,
                PuibeSideNavigationItemComponent,
                RouterTestingModule,
                PuibeHeaderLogoComponent,
                PuibeFooterComponent,
                PuibeFooterMenuItemDirective,
                PuibeFooterCopyrightDirective,
            ],
        }),
    ],
};

export default meta;

type Story = StoryObj<Args>;

const APP_ROUTES: Route[] = [
    {
        path: '',
        pathMatch: 'full',
    },
    {
        path: 'form-elements',
        title: 'PageTitles.FormElements',
    },
    {
        path: 'form-with-hide-invalid',
        title: 'PageTitles.FormWithHideInvalid',
    },
    {
        path: 'expansion-panels',
        title: 'PageTitles.ExpansionPanels',
    },
    {
        path: 'tables',
        title: 'PageTitles.Tables',
    },
    {
        path: 'radio-buttons',
        title: 'PageTitles.RadioButtons',
    },
    {
        path: 'checkboxes',
        title: 'PageTitles.Checkboxes',
    },
    {
        path: 'breadcrumb',
        title: 'PageTitles.Breadcrumb',
        children: [
            {
                path: 'sub1',
                title: 'Sub 1',
                children: [{ path: 'sub2', title: 'Sub 2' }],
            },
            {
                path: 'sub1b',
                title: 'Sub 1b',
                children: [
                    {
                        path: 'sub2b',
                        title: 'Sub 2b',
                    },
                ],
            },
            {
                path: 'sub1c',
                title: 'Sub 1c',
                children: [
                    {
                        path: 'sub2c',
                        title: 'Sub 2c',
                    },
                    {
                        path: 'sub3c',
                        title: 'Sub 3c',
                    },
                    {
                        path: 'sub4c',
                        title: 'Sub 4c',
                        data: { excludeFromMenu: true },
                    },
                ],
            },
        ],
    },
];

export const UseRouterConfig: Story = {
    args: {},
    render: (args) => ({
        props: {
            ...args,
            routes: APP_ROUTES,
        },
        template: `
        <puibe-side-navigation [useRouterConfig]="routes" [open]="true" [noOverlay]="true" [sidemenuFooterTemplate]="footerTemplateRef">  
        <ng-template #footerTemplateRef>
            <puibe-footer>
                <span puibeFooterCopyright>© 2019 - Kanton Bern</span>
                <a puibeFooterMenuItem>Form Elements</a>
                <a puibeFooterMenuItem>Expansion Panels</a>
            </puibe-footer>
        </ng-template>
        </puibe-side-navigation>`,
    }),
};

export const StaticContent: Story = {
    args: {},
    render: (args) => ({
        props: {
            ...args,
            openPane: -1,
        },
        template: `
        <puibe-side-navigation [open]="true" [noOverlay]="true">
            <puibe-side-navigation-pane [open]="true">
                <puibe-header-logo
                        link="/"
                        alt="Logo"
                        caption="Grosser Rat"
                    >
                </puibe-header-logo> 
                <puibe-side-navigation-item [active]="true" routerLink="/test">Grosser Rat des Kantons Bern - Startseite</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true" [expanded]="openPane === 1" (click)="openPane = 1">Der Grosse Rat</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true" [expanded]="openPane === 2" (click)="openPane = 2">Geschäfte</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true" >Sessionen</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true">Wissen</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true" >Sessionen</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true">Wissen</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true" >Sessionen</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true">Wissen</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true" >Sessionen</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true">Wissen</puibe-side-navigation-item>

                            
                <puibe-footer>
                <span puibeFooterCopyright>© 2019 - Kanton Bern</span>
                <a puibeFooterMenuItem>Form Elements</a>
                <a puibeFooterMenuItem>Expansion Panels</a>
                </puibe-footer>
            </puibe-side-navigation-pane>
            <puibe-side-navigation-pane [canClose]="true" [open]="openPane >= 1 && openPane < 2" (openChange)="openPane = -1" heading="Der Grosse Rat">
                <puibe-side-navigation-item routerLink="/test" (click)="openPane = 1.1">Übersicht</puibe-side-navigation-item>
                <puibe-side-navigation-item routerLink="/test/test2">Mitglieder</puibe-side-navigation-item>
                <puibe-side-navigation-item>Organisation</puibe-side-navigation-item>
            </puibe-side-navigation-pane>
            <puibe-side-navigation-pane [canClose]="true" [open]="openPane === 1.1" (openChange)="openPane = -1" heading="Der Grosse Rat">
                <puibe-side-navigation-item routerLink="/test">Übersicht</puibe-side-navigation-item>
                <puibe-side-navigation-item routerLink="/test/test2">Mitglieder</puibe-side-navigation-item>
                <puibe-side-navigation-item>Organisation</puibe-side-navigation-item>
            </puibe-side-navigation-pane>
            <puibe-side-navigation-pane [canClose]="true" [open]="openPane === 2" (openChange)="openPane = -1" heading="Geschäfte">
                <puibe-side-navigation-item >Übersicht</puibe-side-navigation-item>
                <puibe-side-navigation-item>Geschäftssuche</puibe-side-navigation-item>
                <puibe-side-navigation-item [canExpand]="true">Nach Geschäftsarten</puibe-side-navigation-item>
            </puibe-side-navigation-pane>        

        </puibe-side-navigation>`,
    }),
};
