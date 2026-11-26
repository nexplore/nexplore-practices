import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { Size } from '../button/button.directive';
import { PuiIconHamburgerComponent } from '../icons/icon-hamburger.component';
import { PuiIconHomeComponent } from '../icons/icon-home.component';
import { PuiIconLoginComponent } from '../icons/icon-login.component';
import { DropdownMenuOption, PuiDropdownButtonComponent } from './dropdown-button.component';

type Args = {
    triggerButtonContent: string;
    options: DropdownMenuOption[] | string;
    hideArrows: boolean;
    size: Size;
    menuAlignment: 'left' | 'right';
    iconTemplateConfig: object;
    clickHandlers: object;
};

const dropdownOptionsBasic: DropdownMenuOption[] = [
    {
        labelContent: 'This could be a routerLink',
        onClickHandler: () => console.log('fake routerLink clicked'),
    },
    {
        labelContent: 'queryParams could also be set for the routerLink',
        onClickHandler: () => console.log('fake routerLink with queryParams clicked'),
    },
    {
        labelContent: 'You could also do whatever onClick',
        onClickHandler: () => console.log('do whatever magic clicked'),
    },
    {
        labelContent: 'This example simply prints to console',
        onClickHandler: () => console.log('print to console clicked'),
    },
];

const dropdownOptionsShortLabels: DropdownMenuOption[] = [
    {
        labelContent: 'If Labels',
    },
    {
        labelContent: 'Are Shorter',
    },
    {
        labelContent: 'Than Button',
    },
    {
        labelContent: 'Menu will',
    },
    {
        labelContent: 'Match the width',
    },
];

const customDropdownMenuOptions = `[
    {
        iconTemplate: loginIconTemplate,
        labelContent: 'Action One',
        onClickHandler: clickHandlers['optionOne'],
    },
    {
        iconTemplate: homeIconTemplate,
        labelContent: 'Action Two',
        onClickHandler: clickHandlers['optionTwo'],
    },
]`;

const meta: Meta<Args> = {
    title: 'PUIBE/dropdown-button',
    component: PuiDropdownButtonComponent,
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [
                PuiIconLoginComponent,
                PuiIconHamburgerComponent,
                PuiIconHomeComponent,
                PuiDropdownButtonComponent,
                BrowserAnimationsModule,
            ],
        }),
    ],
    render: (args) => {
        const iconTemplates = args.iconTemplateConfig
            ? Object.entries(args.iconTemplateConfig).reduce(
                  (t, [templateId, iconName]) => `
            ${t}
            <ng-template #${templateId}>
                <${iconName} class="inline-flex mr-2" size="s"></${iconName}>
            </ng-template>
        `,
                  '',
              )
            : '';

        const dropdownTemplate = `
            <pui-dropdown-button
                ${typeof args.options === 'string' ? `[options]="${args.options}"` : '[options]="options"'}
                ${args.hideArrows ? '[hideArrows]="hideArrows"' : ''}
                ${args.size ? '[size]="size"' : ''}
                ${args.menuAlignment ? '[menuAlignment]="menuAlignment"' : ''}
            >
                ${args.triggerButtonContent}
            </pui-dropdown-button>`;

        const template = iconTemplates + dropdownTemplate;

        return {
            props: {
                options: dropdownOptionsBasic,
                ...args,
            },
            template,
        };
    },
};

export default meta;

type Story = StoryObj<Args>;

export const BasicDropdown: Story = {
    args: {
        triggerButtonContent: 'Dropdown',
    },
};

export const BasicRightAlignedDropdown: Story = {
    args: {
        triggerButtonContent: 'Dropdown',
        menuAlignment: 'right',
    },
};

export const BasicNoArrowDropdown: Story = {
    args: {
        triggerButtonContent: 'Dropdown',
        hideArrows: true,
    },
};

export const ShorterLabelsDropdown: Story = {
    args: {
        triggerButtonContent: 'Dropdown with shorter option labels',
        options: dropdownOptionsShortLabels,
    },
};

export const CustomizedOptionsDropdown: Story = {
    args: {
        triggerButtonContent: `<pui-icon-hamburger class="inline-flex" size="s"></pui-icon-hamburger>`,
        hideArrows: true,
        size: 'large-round',
        options: customDropdownMenuOptions,
        iconTemplateConfig: { loginIconTemplate: 'pui-icon-login', homeIconTemplate: 'pui-icon-home' },
        clickHandlers: {
            optionOne: () => console.log('Action One triggered'),
            optionTwo: () => console.log('Action Two triggered'),
        },
    },
};

