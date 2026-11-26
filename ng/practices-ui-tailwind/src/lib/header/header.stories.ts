import { IsActiveMatchOptions, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { PuiContainerDirective } from '../common/container.directive';
import { PuiIconHamburgerComponent } from '../icons/icon-hamburger.component';
import { PuiIconLoginComponent } from '../icons/icon-login.component';
import { PuiIconSearchMobileComponent } from '../icons/icon-search-mobile.component';
import { PuiIconSearchComponent } from '../icons/icon-search.component';
import { PuiShellComponent } from '../shell/shell.component';
import { PuiHeaderLanguageMenuItemDirective } from './header-language-menu-item.directive';
import { PuiHeaderLogoComponent } from './header-logo.component';
import { PuiHeaderMainMenuItemDirective } from './header-main-menu-item.directive';
import { PuiHeaderMobileMenuItemDirective } from './header-mobile-menu-item.directive';
import { PuiHeaderServiceMenuItemDirective } from './header-service-menu-item.directive';
import { PuiHeaderComponent } from './header.component';

type Args = {
    logoCaption: string;
    languages?: { language: string; isActive: boolean }[];
    mainMenuItems?: {
        label: string;
        routerLink?: string;
        routerLinkActiveOptions?: IsActiveMatchOptions;
        withAnimation?: boolean;
        isSmall?: boolean;
    }[];
    showSearchIcon?: boolean;
    showSideNav?: boolean;
};

const meta: Meta<Args> = {
    title: 'PUIBE/header',
    component: PuiHeaderComponent,
    tags: ['autodocs'],
    argTypes: {
        logoCaption: { type: 'string' },
        languages: {
            type: {
                name: 'array',
                value: { name: 'object', value: { language: { name: 'string' }, isActive: { name: 'boolean' } } },
            },
        },
        mainMenuItems: {
            type: {
                name: 'array',
                value: {
                    name: 'object',
                    value: {
                        label: { name: 'string' },
                        routerLink: { name: 'string' },
                        routerLinkActiveOptions: {
                            name: 'object',
                            value: {
                                matrixParams: { name: 'enum', value: ['exact', 'subset', 'ignored'] },
                                queryParams: { name: 'enum', value: ['exact', 'subset', 'ignored'] },
                                paths: { name: 'enum', value: ['exact', 'subset'] },
                                fragment: { name: 'enum', value: ['exact', 'ignored'] },
                            },
                        },
                        withAnimation: { name: 'boolean' },
                        isSmall: { name: 'boolean' },
                    },
                },
            },
        },
        showSearchIcon: {
            type: 'boolean',
        },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuiContainerDirective,
                PuiShellComponent,
                PuiHeaderComponent,
                PuiHeaderLanguageMenuItemDirective,
                PuiHeaderLogoComponent,
                PuiHeaderMainMenuItemDirective,
                PuiHeaderMobileMenuItemDirective,
                PuiHeaderServiceMenuItemDirective,
                PuiIconLoginComponent,
                PuiIconSearchComponent,
                PuiIconHamburgerComponent,
                PuiIconSearchMobileComponent,
                RouterTestingModule,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
            routerConfig: [
                {
                    path: '',
                    pathMatch: 'full',
                },
                {
                    path: 'form-elements',
                    title: 'PageTitles.FormElements',
                },
                {
                    path: 'tables',
                    title: 'PageTitles.Tables',
                    children: [
                        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((n) => ({
                            path: `${n}`,
                            title: `Child ${n}`,
                        })),
                    ],
                },
                {
                    path: 'expansion-panels',
                    title: 'PageTitles.ExpansionPanels',
                },
                ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
                    path: `${n}`,
                    title: `Child ${n}`,
                })),
            ] as Routes,
            onLanguageChange: (language: string) => console.log(language),
        },
        template: `
        <pui-shell>
                <pui-header [routerConfig]="routerConfig">
                    <pui-header-logo
                        link="/"
                        image="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Logo_Kanton_Bern_Canton_de_Berne.svg/1200px-Logo_Kanton_Bern_Canton_de_Berne.svg.png"
                        alt="Logo"
                        [caption]="logoCaption">
                    </pui-header-logo>

                    <button type="button" puiHeaderServiceMenuItem>
                        <pui-icon-login class="inline-block w-5 mr-1"></pui-icon-login>
                        Login
                    </button>
                    <button type="button" puiHeaderServiceMenuItem navLink="/">Home</button>
                    <button type="button" puiHeaderServiceMenuItem navLink="/practices-ui-tailwind-samples">Subnav</button>
                    <div puiHeaderServiceMenuItem [withAnimation]="false">
                        <span>Mandat:</span>
                        <select class="cursor-pointer font-bold">
                            <option>Mandat 1</option>
                            <option>Mandat 2</option>
                        </select>
                    </div>
                    <a puiHeaderServiceMenuItem routerLink="/practices-ui-tailwind-samples/header">Header</a>

                    <button type="button" puiHeaderLanguageMenuItem *ngFor="let language of languages" (languageChanged)="onLanguageChange($event)" [isActive]="language.isActive">{{language.language}}</button>

                    <a puiHeaderMainMenuItem *ngFor="let mainMenuItem of mainMenuItems" [isSmall]="mainMenuItem.isSmall" [routerLink]="mainMenuItem.routerLink">{{mainMenuItem.label}}</a>
                    <button type="button" puiHeaderMainMenuItem [isIcon]="true" [isSmall]="false" [withAnimation]="false" *ngIf="showSearchIcon">
                        <pui-icon-search></pui-icon-search>
                    </button>
                    <button type="button" puiHeaderMainMenuItem [isIcon]="true" [isSmall]="false" [withAnimation]="false" *ngIf="showSideNav">
                        <pui-icon-hamburger></pui-icon-hamburger>
                    </button>

                    <button type="button" puiHeaderMobileMenuItem class="w-8 h-8">
                        <pui-icon-search-mobile ></pui-icon-search-mobile>
                    </button>
                </pui-header>
        </pui-shell>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const BigMainMenuItemsHeader: Story = {
    args: {
        logoCaption: 'Samples Header',
        languages: [
            {
                language: 'DE',
                isActive: true,
            },
            {
                language: 'FR',
                isActive: false,
            },
        ],
        mainMenuItems: [
            {
                label: 'First Item',
                routerLink: '/',
                isSmall: false,
            },
            {
                label: 'Second Item',
                routerLink: '/?path=/docs/pui-header--docs',
                isSmall: false,
            },
        ],
        showSearchIcon: true,
    },
};

export const SmallMainMenuItemsHeader: Story = {
    args: {
        logoCaption: 'Samples Header',
        languages: [
            {
                language: 'DE',
                isActive: true,
            },
            {
                language: 'FR',
                isActive: false,
            },
        ],
        mainMenuItems: [
            {
                label: 'First Item',
                routerLink: '/',
                isSmall: true,
            },
            {
                label: 'Second Item',
                routerLink: '/?path=/docs/pui-header--docs',
                isSmall: true,
            },
        ],
        showSearchIcon: true,
    },
};

export const FrenchHeader: Story = {
    args: {
        logoCaption: 'Samples Header',
        languages: [
            {
                language: 'DE',
                isActive: false,
            },
            {
                language: 'FR',
                isActive: true,
            },
        ],
        mainMenuItems: [
            {
                label: 'First Item',
                routerLink: '/',
                isSmall: false,
            },
            {
                label: 'Second Item',
                routerLink: '/?path=/docs/pui-header--docs',
                isSmall: false,
            },
        ],
        showSearchIcon: true,
    },
};

export const FourLanguagesHeader: Story = {
    args: {
        logoCaption: 'Samples Header',
        languages: [
            {
                language: 'DE',
                isActive: false,
            },
            {
                language: 'FR',
                isActive: false,
            },
            {
                language: 'IT',
                isActive: false,
            },
            {
                language: 'EN',
                isActive: true,
            },
        ],
        mainMenuItems: [
            {
                label: 'First Item',
                routerLink: '/',
                isSmall: false,
            },
            {
                label: 'Second Item',
                routerLink: '/?path=/docs/pui-header--docs',
                isSmall: false,
            },
        ],
        showSearchIcon: true,
    },
};

export const SecondMainMenuItemActiveHeader: Story = {
    args: {
        logoCaption: 'Samples Header',
        languages: [
            {
                language: 'DE',
                isActive: false,
            },
            {
                language: 'FR',
                isActive: false,
            },
            {
                language: 'IT',
                isActive: false,
            },
            {
                language: 'EN',
                isActive: true,
            },
        ],
        mainMenuItems: [
            {
                label: 'First Item',
                routerLink: '/?path=/docs/pui-header--docs',
                isSmall: false,
            },
            {
                label: 'Second Item',
                routerLink: '/',
                isSmall: false,
            },
        ],
        showSearchIcon: true,
    },
};

export const WithoutSearchIconHeader: Story = {
    args: {
        logoCaption: 'Samples Header',
        languages: [
            {
                language: 'DE',
                isActive: true,
            },
            {
                language: 'FR',
                isActive: false,
            },
        ],
        mainMenuItems: [
            {
                label: 'First Item',
                routerLink: '/',
                isSmall: false,
            },
            {
                label: 'Second Item',
                routerLink: '/?path=/docs/pui-header--docs',
                isSmall: false,
            },
        ],
        showSearchIcon: false,
    },
};

export const WithSideMenu: Story = {
    args: {
        logoCaption: 'Samples Header',
        languages: [
            {
                language: 'DE',
                isActive: true,
            },
            {
                language: 'FR',
                isActive: false,
            },
        ],
        mainMenuItems: [
            {
                label: 'First Item',
                routerLink: '/',
                isSmall: false,
            },
            {
                label: 'Second Item',
                routerLink: '/?path=/docs/pui-header--docs',
                isSmall: false,
            },
        ],
        showSideNav: true,
    },
};

