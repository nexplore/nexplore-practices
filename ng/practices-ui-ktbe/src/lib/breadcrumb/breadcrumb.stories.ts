import { RouterTestingModule } from '@angular/router/testing';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeBreadcrumbComponent } from './breadcrumb.component';
import { PuibeBreadcrumbItemComponent } from './item/breadcrumb-item.component';

type Args = {};

function getTemplate(_args: Args) {
    return `
    <puibe-breadcrumb>
        <puibe-breadcrumb-item routerLink="/"></puibe-breadcrumb-item>
        <puibe-breadcrumb-item routerLink="/test">erste Hierarchie</puibe-breadcrumb-item>
        <puibe-breadcrumb-item routerLink="/test/test2">zweite Hierarchie</puibe-breadcrumb-item>
        <puibe-breadcrumb-item>aufgerufene Seite</puibe-breadcrumb-item>
    </puibe-breadcrumb>`;
}

const meta: Meta<Args> = {
    title: 'PUIBE/breadcrumb',
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [PuibeBreadcrumbComponent, PuibeBreadcrumbItemComponent, RouterTestingModule],
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
