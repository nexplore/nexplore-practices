import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { ConnectedPosition } from '@angular/cdk/overlay';

import { Component, Inject, Input } from '@angular/core';
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { MODAL_PROVIDERS, PracticesTailwindDefaultModule } from '../../index';
import { PuiButtonDirective } from '../button/button.directive';
import { PuiFlyoutContentDirective } from './flyout-content.directive';
import { PuiFlyoutFooterActionDirective } from './flyout-footer-action.directive';
import { PuiFlyoutTitleDirective } from './flyout-title.directive';
import { FLYOUT_PROVIDERS, PuiFlyoutComponent } from './flyout.component';
import { PuiFlyoutService } from './flyout.service';
import { PuiModalContentDirective } from './modal-content.directive';
import { PuiModalFooterActionDirective } from './modal-footer-action.directive';
import { PuiModalSubtitleDirective } from './modal-subtitle.directive';
import { PuiModalTitleDirective } from './modal-title.directive';
import { PuiModalComponent } from './modal.component';
import { PuiModalService } from './modal.service';

type Args = {
    title: string;
    subtitle?: string;
    text: string;
    hideCloseButton?: boolean;
    buttonsAlignment?: string;
    flyoutPreferredPosition?: ConnectedPosition;
    flyoutOverridePositions?: ConnectedPosition[];
    customTitleClass?: string;
    customSubtitleClass?: string;
    controlType: 'modal' | 'flyout';
};
/* example Component for flyout*/
@Component({
    standalone: true,
    selector: 'app-flyout',
    template: `
        <pui-flyout class="block min-w-[400px]">
            <div puiFlyoutTitle>{{ data.title ?? 'Flyout Title' }}</div>
            <div puiFlyoutContent>{{ data.text ?? 'Do you really want to get free rubies?' }}</div>
            <button puiFlyoutFooterAction puiButton variant="primary">OK</button>
            <button puiFlyoutFooterAction puiButton>Cancel</button>
        </pui-flyout>
    `,
    imports: [
    DialogModule,
    PuiFlyoutComponent,
    PuiFlyoutContentDirective,
    PuiFlyoutTitleDirective,
    PuiFlyoutFooterActionDirective,
    PuiButtonDirective
],
})
class AppFlyoutComponent {
    constructor(
        public dialogRef: DialogRef,
        @Inject(DIALOG_DATA) public data: Args,
    ) {}
}

@Component({
    standalone: true,
    selector: 'app-modal',
    template: `
        <pui-modal [hideCloseButton]="data.hideCloseButton" class="block min-w-[400px]">
            <h2 puiModalTitle>Modal Title</h2>
            <h3 puiModalSubtitle>Modal Subtitle</h3>
            <div puiModalContent>Do you really want to get free diamonds?</div>
            <button puiModalFooterAction puiButton [shouldClose]="false" variant="primary">OK</button>
            <button puiModalFooterAction puiButton>Cancel</button>
        </pui-modal>
    `,
    imports: [
        PuiModalComponent,
        PuiModalContentDirective,
        PuiModalTitleDirective,
        PuiModalSubtitleDirective,
        PuiModalFooterActionDirective,
        PuiButtonDirective,
    ],
})
class AppModalComponent {
    constructor(
        public dialogRef: DialogRef,
        @Inject(DIALOG_DATA) public data: Args,
    ) {}
}
/* Component to open modals from buttons */
@Component({
    standalone: true,
    selector: 'app-launcher',
    template: `<div>
        <p class="text-h4 mb-2">Click the buttons to see Modal & Flyout in action!</p>
        <button puiButton (click)="openModal()" class="mr-6">open modal</button>
        <button puiButton #btn1 (click)="openFlyout(btn1, false)" class="mr-6">open flyout</button>
        <button puiButton #btn2 (click)="openFlyout(btn2, true)" class="mr-6">open flyout with arrow-tips</button>
    </div>`,
    providers: [...FLYOUT_PROVIDERS, ...MODAL_PROVIDERS],
    imports: [
    PuiButtonDirective,
    DialogModule,
    AppFlyoutComponent,
    AppModalComponent,
    PracticesTailwindDefaultModule
],
})
class LaunchComponent {
    @Input() public args: Args;

    constructor(
        private readonly _modalService: PuiModalService,
        private readonly _flyoutService: PuiFlyoutService,
    ) {}

    public openModal(): void {
        const ref = this._modalService.open(AppModalComponent, {
            data: { name: 'diamonds', ...this.args },
        });

        ref.closed.subscribe((data) => console.log('Closed with data', data));
    }

    openFlyout(buttonRef: HTMLElement, showArrowTips: boolean): void {
        this._flyoutService.open(
            AppFlyoutComponent,
            {
                data: { name: 'rubies', ...this.args },
                overridePositions: this.args?.flyoutOverridePositions,
                preferredPosition: this.args?.flyoutPreferredPosition,
                showArrowTips: showArrowTips,
            },
            buttonRef,
        );
    }
}

function getCustomClass(className: string) {
    return className ? 'class="' + className + '"' : '';
}

const meta: Meta<Args> = {
    title: 'PUIBE/popups',
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [
                PuiFlyoutComponent,
                PuiFlyoutTitleDirective,
                PuiFlyoutContentDirective,
                PuiFlyoutFooterActionDirective,
                PuiModalComponent,
                PuiModalTitleDirective,
                PuiModalSubtitleDirective,
                PuiModalContentDirective,
                PuiModalFooterActionDirective,
                PuiButtonDirective,
                LaunchComponent,
            ],
            providers: [...FLYOUT_PROVIDERS, ...MODAL_PROVIDERS],
        }),
    ],
    argTypes: {
        controlType: {
            type: {
                name: 'enum',
                value: ['modal', 'flyout'],
                required: true,
            },
        },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        text: { type: 'string' },
        customTitleClass: { type: 'string' },
        customSubtitleClass: { type: 'string' },
        hideCloseButton: { type: 'boolean', defaultValue: false },
        buttonsAlignment: {
            type: {
                name: 'enum',
                value: ['start', 'end'],
            },
        },
        flyoutOverridePositions: {
            control: 'select',
            defaultValue: 'default',
            options: ['automatic', 'left', 'top', 'right', 'bottom'],
            mapping: {
                automatic: null,
                left: [{ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' }],
                top: [{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' }],
                right: [{ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' }],
                bottom: [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }],
            },
        },
        flyoutPreferredPosition: {
            control: 'select',
            defaultValue: 'default',
            options: ['automatic', 'left', 'top', 'right', 'bottom'],
            mapping: {
                automatic: null,
                left: { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center' },
                top: { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
                right: { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' },
                bottom: { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
            },
        },
    },
    render: (args) => ({
        props: {
            ...args,
        },
        template:
            args.controlType === 'flyout'
                ? `
        <pui-flyout [buttonsAlignment]="'${args.buttonsAlignment}'"  class="block w-3/4 md:w-1/2">
            <div puiFlyoutTitle ${getCustomClass(args.customTitleClass)}>${args.title}</div>
            <div puiFlyoutContent>${args.text}</div>
            <button puiFlyoutFooterAction puiButton [shouldClose]="false" variant="primary">OK</button>
            <button puiFlyoutFooterAction puiButton>Cancel</button>
        </pui-flyout>`
                : `
        <pui-modal 
            [hideCloseButton]="${args.hideCloseButton}"
            [buttonsAlignment]="'${args.buttonsAlignment}'"
            class="block w-3/4 md:w-1/2">
            <h2 puiModalTitle ${getCustomClass(args.customTitleClass)}>${args.title}</h2>
            ${
                args.subtitle
                    ? `<h3 puiModalSubtitle ${getCustomClass(args.customSubtitleClass)}>${args.subtitle}</h3>`
                    : ''
            }
            <div puiModalContent>${args.text}</div>
            <button puiModalFooterAction puiButton [shouldClose]="false" variant="primary">OK</button>
            <button puiModalFooterAction puiButton>Cancel</button>
        </pui-modal>`,
    }),
};

export default meta;

export const flyout: StoryObj<Args> = {
    decorators: [
        moduleMetadata({
            providers: [...FLYOUT_PROVIDERS],
        }),
    ],
    args: {
        controlType: 'flyout',
        title: 'Flyout Title',
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        buttonsAlignment: 'start',
    },
};

export const modal: StoryObj<Args> = {
    decorators: [
        moduleMetadata({
            providers: [...MODAL_PROVIDERS],
        }),
    ],
    args: {
        controlType: 'modal',
        title: 'Modal Title',
        subtitle: 'Modal Subtitle',
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        hideCloseButton: false,
        buttonsAlignment: 'start',
    },
};

export const modalAndFlyoutService: StoryObj<Args> = {
    render: (args) => ({
        props: {
            ...args,
            args,
        },
        template: `<app-launcher [args]="args"></app-launcher>`,
    }),
};

