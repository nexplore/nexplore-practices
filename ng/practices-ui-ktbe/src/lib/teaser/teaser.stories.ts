import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeTeaserComponent } from './teaser.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

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
    component: PuibeTeaserComponent,
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [PuibeTeaserComponent, BrowserAnimationsModule, RouterTestingModule, CommonModule],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <puibe-teaser [title]="title" [titleLevel]="titleLevel" [subtitleLevel]="subtitleLevel" [subtitle]="subtitle" [teaserLink]="teaserLink">
            <ng-container *ngIf="text">${args.text}</ng-container>
        </puibe-teaser>`,
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
