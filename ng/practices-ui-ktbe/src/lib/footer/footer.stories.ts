import { IsActiveMatchOptions } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { PuibeFooterCopyrightDirective } from './footer-copyright.directive';
import { PuibeFooterMenuItemDirective } from './footer-menu-item.directive';
import { PuibeFooterComponent } from './footer.component';
import { PuibeFooterLanguageMenuItemDirective } from './footer-language-menu-item.directive';
import { PuibeSidenavFooterComponent } from './sidenav-footer.component';

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
    component: PuibeFooterComponent,
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
                PuibeFooterComponent,
                PuibeSidenavFooterComponent,
                PuibeFooterCopyrightDirective,
                PuibeFooterMenuItemDirective,
                PuibeFooterLanguageMenuItemDirective,
                RouterTestingModule,
            ],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <puibe-footer [flexBreakpoint]="flexBreakpoint">
            <span puibeFooterCopyright>{{ copyright }}</span>
            <a puibeFooterMenuItem *ngFor="let menuItem of footerMenuItems"
                [routerLink]="menuItem.routerLink"
                [withAnimation]="menuItem.withAnimation"
                [routerLinkActiveOptions]="menuItem.routerLinkActiveOptions">{{ menuItem.label }}</a>
        </puibe-footer>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Footer: Story = {
    args: {
        flexBreakpoint: 'md',
        copyright: '© 2019 - Kanton Bern',
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
        copyright: '© 2019 - Kanton Bern',
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
        copyright: '© 2019 - Kanton Bern',
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
        <puibe-sidenav-footer>
            <span puibeFooterCopyright>{{ copyright }}</span>
            <a puibeFooterMenuItem *ngFor="let menuItem of footerMenuItems"
                [routerLink]="menuItem.routerLink"
                [withAnimation]="menuItem.withAnimation"
                [routerLinkActiveOptions]="menuItem.routerLinkActiveOptions">{{ menuItem.label }}</a>
        </puibe-sidenav-footer>`,
    }),
};
