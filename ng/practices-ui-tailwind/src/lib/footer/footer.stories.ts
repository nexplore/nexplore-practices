import { IsActiveMatchOptions } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { PuiFooterCopyrightDirective } from './footer-copyright.directive';
import { PuiFooterLanguageMenuItemDirective } from './footer-language-menu-item.directive';
import { PuiFooterMenuItemDirective } from './footer-menu-item.directive';
import { PuiFooterComponent } from './footer.component';
import { PuiSidenavFooterComponent } from './sidenav-footer.component';

type Args = {
    copyright: string;
    flexBreakpoint: 'md' | 'lg';
    footerMenuItems?: {
        label: string;
        routerLink?: string;
        routerLinkActiveOptions?: IsActiveMatchOptions;
        withAnimation?: boolean;
    }[];
};

const meta: Meta<Args> = {
    title: 'PUIBE/footer',
    component: PuiFooterComponent,
    tags: ['autodocs'],
    argTypes: {
        copyright: { type: 'string' },
        flexBreakpoint: { type: { name: 'enum', value: ['md', 'lg'] }, defaultValue: 'md' },
        footerMenuItems: {
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
                    },
                },
            },
        },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuiFooterComponent,
                PuiSidenavFooterComponent,
                PuiFooterCopyrightDirective,
                PuiFooterMenuItemDirective,
                PuiFooterLanguageMenuItemDirective,
                RouterTestingModule,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <pui-footer [flexBreakpoint]="flexBreakpoint">
            <span puiFooterCopyright>{{ copyright }}</span>
            <a puiFooterMenuItem *ngFor="let menuItem of footerMenuItems"
                [routerLink]="menuItem.routerLink"
                [withAnimation]="menuItem.withAnimation"
                [routerLinkActiveOptions]="menuItem.routerLinkActiveOptions">{{ menuItem.label }}</a>
        </pui-footer>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Footer: Story = {
    args: {
        flexBreakpoint: 'md',
        copyright: '© 2025 - Nexplore',
        footerMenuItems: [
            {
                label: 'Kontakt',
                routerLink: '/?path=kontakt',
                withAnimation: true,
            },
            {
                label: 'Datenschutz',
                routerLink: '/?path=datenschutz',
                withAnimation: true,
            },
            {
                label: 'Impressum',
                routerLink: '/?path=impressum',
            },
        ],
    },
};

export const FooterWithFlexBreakpointLg: Story = {
    args: {
        flexBreakpoint: 'lg',
        copyright: '© 2025 - Nexplore',
        footerMenuItems: [
            {
                label: 'Kontakt',
                routerLink: '/?path=kontakt',
                withAnimation: true,
            },
            {
                label: 'Datenschutz',
                routerLink: '/?path=datenschutz',
                withAnimation: true,
            },
            {
                label: 'Impressum',
                routerLink: '/?path=impressum',
            },
        ],
    },
};

export const SidenavFooter: Story = {
    args: {
        copyright: '© 2025 - Nexplore',
        footerMenuItems: [
            {
                label: 'Kontakt',
                routerLink: '/?path=kontakt',
                withAnimation: true,
            },
            {
                label: 'Datenschutz',
                routerLink: '/?path=datenschutz',
                withAnimation: true,
            },
            {
                label: 'Impressum',
                routerLink: '/?path=impressum',
            },
        ],
    },
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <pui-sidenav-footer>
            <span puiFooterCopyright>{{ copyright }}</span>
            <a puiFooterMenuItem *ngFor="let menuItem of footerMenuItems"
                [routerLink]="menuItem.routerLink"
                [withAnimation]="menuItem.withAnimation"
                [routerLinkActiveOptions]="menuItem.routerLinkActiveOptions">{{ menuItem.label }}</a>
        </pui-sidenav-footer>`,
    }),
};

