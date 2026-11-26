import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiTeaserComponent } from './teaser.component';

type Args = {
    text: string;
    title: string;
    titleLevel: string;
    subtitle: string;
    subtitleLevel: string;
    teaserLink: string;
};

const meta: Meta<Args> = {
    title: 'PUIBE/teaser',
    component: PuiTeaserComponent,
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [PuiTeaserComponent, BrowserAnimationsModule, RouterTestingModule, CommonModule],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <pui-teaser [title]="title" [titleLevel]="titleLevel" [subtitleLevel]="subtitleLevel" [subtitle]="subtitle" [teaserLink]="teaserLink">
            <ng-container *ngIf="text">${args.text}</ng-container>
        </pui-teaser>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const teaserDefaultCloseable: Story = {
    args: {
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        title: 'Teaser Title',
        teaserLink: '/',
    },
};

export const teaserDefaultCloseableWithoutText: Story = {
    args: {
        title: 'Teaser Title',
        teaserLink: '/',
    },
};

export const teaserDefaultCloseableWithSubtitle: Story = {
    args: {
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        title: 'Teaser Title',
        titleLevel: '2',
        subtitle: 'Teaser Subtitle',
        subtitleLevel: '3',
        teaserLink: '/',
    },
};

