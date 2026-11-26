import { RouterTestingModule } from '@angular/router/testing';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiBreadcrumbComponent } from './breadcrumb.component';
import { PuiBreadcrumbItemComponent } from './item/breadcrumb-item.component';

type Args = {};

function getTemplate(_args: Args) {
    return `
    <pui-breadcrumb>
        <pui-breadcrumb-item routerLink="/"></pui-breadcrumb-item>
        <pui-breadcrumb-item routerLink="/test">erste Hierarchie</pui-breadcrumb-item>
        <pui-breadcrumb-item routerLink="/test/test2">zweite Hierarchie</pui-breadcrumb-item>
        <pui-breadcrumb-item>aufgerufene Seite</pui-breadcrumb-item>
    </pui-breadcrumb>`;
}

const meta: Meta<Args> = {
    title: 'PUIBE/breadcrumb',
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [PuiBreadcrumbComponent, PuiBreadcrumbItemComponent, RouterTestingModule],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: getTemplate(args),
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Default: Story = {
    args: {},
};

