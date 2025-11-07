import { Route } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiFooterCopyrightDirective } from '../footer/footer-copyright.directive';
import { PuiFooterMenuItemDirective } from '../footer/footer-menu-item.directive';
import { PuiFooterComponent } from '../footer/footer.component';
import { PuiHeaderLogoComponent } from '../header/header-logo.component';
import { PuiSideNavigationItemComponent } from './item/side-navigation-item.component';
import { PuiSideNavigationPaneComponent } from './pane/side-navigation-pane.component';
import { PuiSideNavigationComponent } from './side-navigation.component';

type Args = {};

const meta: Meta<Args> = {
    title: 'PUIBE/side-navigation',
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [
                PuiSideNavigationComponent,
                PuiSideNavigationPaneComponent,
                PuiSideNavigationItemComponent,
                RouterTestingModule,
                PuiHeaderLogoComponent,
                PuiFooterComponent,
                PuiFooterMenuItemDirective,
                PuiFooterCopyrightDirective,
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
        <pui-side-navigation [useRouterConfig]="routes" [open]="true" [noOverlay]="true" [sidemenuFooterTemplate]="footerTemplateRef">  
        <ng-template #footerTemplateRef>
            <pui-footer>
                <span puiFooterCopyright>© 2025 - Nexplore</span>
                <a puiFooterMenuItem>Form Elements</a>
                <a puiFooterMenuItem>Expansion Panels</a>
            </pui-footer>
        </ng-template>
        </pui-side-navigation>`,
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
        <pui-side-navigation [open]="true" [noOverlay]="true">
            <pui-side-navigation-pane [open]="true">
                <pui-header-logo
                        link="/"
                        alt="Logo"
                        caption="Grosser Rat"
                    >
                </pui-header-logo> 
                <pui-side-navigation-item [active]="true" routerLink="/test">Grosser Rat des Kantons Bern - Startseite</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true" [expanded]="openPane === 1" (click)="openPane = 1">Der Grosse Rat</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true" [expanded]="openPane === 2" (click)="openPane = 2">Geschäfte</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true" >Sessionen</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true">Wissen</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true" >Sessionen</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true">Wissen</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true" >Sessionen</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true">Wissen</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true" >Sessionen</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true">Wissen</pui-side-navigation-item>

                            
                <pui-footer>
                <span puiFooterCopyright>© 2025 - Nexplore</span>
                <a puiFooterMenuItem>Form Elements</a>
                <a puiFooterMenuItem>Expansion Panels</a>
                </pui-footer>
            </pui-side-navigation-pane>
            <pui-side-navigation-pane [canClose]="true" [open]="openPane >= 1 && openPane < 2" (openChange)="openPane = -1" heading="Der Grosse Rat">
                <pui-side-navigation-item routerLink="/test" (click)="openPane = 1.1">Übersicht</pui-side-navigation-item>
                <pui-side-navigation-item routerLink="/test/test2">Mitglieder</pui-side-navigation-item>
                <pui-side-navigation-item>Organisation</pui-side-navigation-item>
            </pui-side-navigation-pane>
            <pui-side-navigation-pane [canClose]="true" [open]="openPane === 1.1" (openChange)="openPane = -1" heading="Der Grosse Rat">
                <pui-side-navigation-item routerLink="/test">Übersicht</pui-side-navigation-item>
                <pui-side-navigation-item routerLink="/test/test2">Mitglieder</pui-side-navigation-item>
                <pui-side-navigation-item>Organisation</pui-side-navigation-item>
            </pui-side-navigation-pane>
            <pui-side-navigation-pane [canClose]="true" [open]="openPane === 2" (openChange)="openPane = -1" heading="Geschäfte">
                <pui-side-navigation-item >Übersicht</pui-side-navigation-item>
                <pui-side-navigation-item>Geschäftssuche</pui-side-navigation-item>
                <pui-side-navigation-item [canExpand]="true">Nach Geschäftsarten</pui-side-navigation-item>
            </pui-side-navigation-pane>        

        </pui-side-navigation>`,
    }),
};

