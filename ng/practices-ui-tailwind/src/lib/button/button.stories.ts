import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PracticesTailwindTableComponentsModule } from '../../index';
import { PuiIconGoNextComponent } from '../icons/icon-go-next.component';
import { PuiIconHomeComponent } from '../icons/icon-home.component';
import { PuiIconLoginComponent } from '../icons/icon-login.component';
import { PuiIconSearchComponent } from '../icons/icon-search.component';
import { PuiButtonArrowsComponent } from './button-arrows.component';
import { PuiButtonSpinnerComponent } from './button-spinner.component';
import { PuiButtonDirective } from './button.directive';

type Args = {};

const meta: Meta<Args> = {
    title: 'PUIBE/button',
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [
                PuiButtonDirective,
                PuiButtonArrowsComponent,
                PuiButtonSpinnerComponent,
                PuiIconLoginComponent,
                PuiIconGoNextComponent,
                PuiIconSearchComponent,
                PuiIconHomeComponent,
                BrowserAnimationsModule,
                PracticesTailwindTableComponentsModule,
            ],
        }),
    ],
    render: () => ({}),
};

export default meta;

type Story = StoryObj<Args>;

export const PrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary">Button</button>`,
    }),
};

export const SecondaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton>Button</button>`,
    }),
};

export const DangerButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger">Button</button>`,
    }),
};

export const DangerPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary">Button</button>`,
    }),
};

export const AcceptButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept">Button</button>`,
    }),
};

export const AcceptPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary">Button</button>`,
    }),
};

export const PrimaryLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puiButton variant="primary">Link</a>`,
    }),
};

export const SecondaryLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puiButton>Link</a>`,
    }),
};

export const DangerLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puiButton variant="danger">Link</a>`,
    }),
};

export const DangerPrimaryLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puiButton variant="danger-primary">Link</a>`,
    }),
};

export const AcceptLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puiButton variant="accept">Link</a>`,
    }),
};

export const AcceptPrimaryLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puiButton variant="accept-primary">Link</a>`,
    }),
};

export const DisabledPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" disabled>Button</button>`,
    }),
};

export const DisabledSecondaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton disabled>Button</button>`,
    }),
};

export const DisabledDangerButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger" disabled>Button</button>`,
    }),
};

export const DisabledDangerPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary" disabled>Button</button>`,
    }),
};

export const DisabledAcceptButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" disabled>Button</button>`,
    }),
};

export const DisabledAcceptPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" disabled>Button</button>`,
    }),
};

export const ButtonWithIcon: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton>
            <pui-icon-login class="w-5 h-4"></pui-icon-login>
            Button
        </button>`,
    }),
};

export const PrimaryButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" [scaleOnHover]="false">
            <pui-button-arrows variant="left-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};

export const SecondaryButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton [scaleOnHover]="false">
        <pui-button-arrows variant="left-arrow">Button</pui-button-arrows>
    </button>`,
    }),
};

export const DangerButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger" [scaleOnHover]="false">
            <pui-button-arrows variant="left-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};

export const DangerPrimaryButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary" [scaleOnHover]="false">
            <pui-button-arrows variant="left-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};

export const AcceptButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" [scaleOnHover]="false">
            <pui-button-arrows variant="left-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};
export const AcceptPrimaryButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" [scaleOnHover]="false">
            <pui-button-arrows variant="left-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};

export const PrimaryButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" [scaleOnHover]="false">
            <pui-button-arrows variant="right-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};

export const SecondaryButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton [scaleOnHover]="false">
        <pui-button-arrows variant="right-arrow">Button</pui-button-arrows>
    </button>`,
    }),
};

export const DangerButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger" [scaleOnHover]="false">
            <pui-button-arrows variant="right-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};

export const DangerPrimaryButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary" [scaleOnHover]="false">
            <pui-button-arrows variant="right-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};

export const AcceptButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" [scaleOnHover]="false">
            <pui-button-arrows variant="right-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};

export const AcceptPrimaryButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" [scaleOnHover]="false">
            <pui-button-arrows variant="right-arrow">Button</pui-button-arrows>
        </button>`,
    }),
};

export const PrimaryButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const SecondaryButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const DangerButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const DangerPrimaryButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const AcceptButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};
export const AcceptPrimaryButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const PrimaryButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" [busy]="true">
        Button
    </button>`,
    }),
};

export const SecondaryButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton [busy]="true">
        Button
    </button>`,
    }),
};

export const DangerButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger" [busy]="true">
        Button
    </button>`,
    }),
};

export const DangerParimaryButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary" [busy]="true">
        Button
    </button>`,
    }),
};

export const AcceptButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" [busy]="true">
        Button
    </button>`,
    }),
};

export const AcceptParimaryButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" [busy]="true">
        Button
    </button>`,
    }),
};

export const PrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" size="small">i</button>`,
    }),
};

export const SecondarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton size="small">
            <pui-icon-search class="w-full"></pui-icon-search>
        </button>`,
    }),
};

export const DangerSmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger" size="small">x</button>`,
    }),
};

export const DangerPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary" size="small">x</button>`,
    }),
};

export const AcceptSmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" size="small">✓</button>`,
    }),
};

export const AcceptPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" size="small">✓</button>`,
    }),
};

export const DisabledPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" size="small" disabled>i</button>`,
    }),
};

export const DisabledSecondarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton size="small" disabled>
            <pui-icon-search class="w-full"></pui-icon-search>
        </button>`,
    }),
};

export const DisabledDangerSmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger" size="small" disabled>x</button>`,
    }),
};

export const DisabledDangerPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary" size="small" disabled>x</button>`,
    }),
};

export const DisabledAcceptSmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" size="small" disabled>✓</button>`,
    }),
};

export const DisabledAcceptPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" size="small" disabled>✓</button>`,
    }),
};

export const PrimarySmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" size="small" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const SecondarySmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton size="small" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const DangerSmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger" size="small" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const DangerPrimarySmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary" size="small" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const AcceptSmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" size="small" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const AcceptPrimarySmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" size="small" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};
export const BusyAndDisabledFalse: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton [busy]="true" [disabled]="false">
        <pui-button-spinner>Button</pui-button-spinner> Busy and disabled
    </button>`,
    }),
};

export const SmallButtonInTable: Story = {
    render: (_args) => ({
        props: {
            onActionClick: (act: number) => console.log('clicked col action', act),
        },
        template: `
        <pui-table class="w-full">
            <pui-table-column >H1</pui-table-column>
            <pui-table-column >H2</pui-table-column>
            <pui-table-column >H3</pui-table-column>
            <pui-table-column class="w-auto"></pui-table-column>

            <pui-table-row>
                <pui-table-cell>A1</pui-table-cell>
                <pui-table-cell>A2</pui-table-cell>
                <pui-table-cell>A3</pui-table-cell>
                <pui-table-cell>
                    <pui-table-col-actions>
                        <button puiButton size="small" type="button" title="Details" aria-label="Details" (click)="onActionClick(1)"><pui-icon-search size="s"></pui-icon-search></button>
                        <button puiButton variant="danger" size="small" type="button" title="Löschen" aria-label="Löschen">x</button>
                    </pui-table-col-actions>
                </pui-table-cell>
            </pui-table-row>

            <pui-table-row>
                <pui-table-cell>B1</pui-table-cell>
                <pui-table-cell>B2</pui-table-cell>
                <pui-table-cell>B3</pui-table-cell>
                <pui-table-cell>
                    <pui-table-col-actions>
                        <button puiButton size="small" type="button" title="Details" aria-label="Details" (click)="onActionClick(2)"><pui-icon-search size="s"></pui-icon-search></button>
                        <button puiButton variant="danger" size="small" type="button" title="Löschen" aria-label="Löschen">x</button>
                    </pui-table-col-actions>
                </pui-table-cell>
            </pui-table-row>
        </pui-table>`,
    }),
};

export const PrimaryLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" size="large-round">
            <pui-icon-home size="m"></pui-icon-home>
        </button>`,
    }),
};

export const SecondaryLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton size="large-round">
            <pui-icon-search size="m"></pui-icon-search>
        </button>`,
    }),
};

export const AcceptLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" size="large-round">✓</button>`,
    }),
};

export const AcceptPrimaryLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" size="large-round">✓</button>`,
    }),
};

export const DisabledAcceptLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" size="large-round" disabled>✓</button>`,
    }),
};

export const DisabledAcceptPrimaryLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" size="large-round" disabled>✓</button>`,
    }),
};

export const PrimaryLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="primary" size="large-round" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const SecondaryLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton size="large-round" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const DangerLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger" size="large-round" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const DangerPrimaryLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="danger-primary" size="large-round" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const AcceptLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept" size="large-round" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const AcceptPrimaryLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puiButton variant="accept-primary" size="large-round" [busy]="true">
        <pui-button-spinner>Button</pui-button-spinner>
    </button>`,
    }),
};

export const AnimationSmoothing: Story = {
    render: (_) => ({
        template: `
        <p>Without smooth animation transform: <button type="button" puiButton variant="primary" [disableSmoothAnimationTransform]="true">   <pui-icon-login class="w-5 h-4"></pui-icon-login> Button</button></p>
        <p class="pt-1">With smooth animation transform: <button type="button" puiButton variant="primary">   <pui-icon-login class="w-5 h-4"></pui-icon-login> Button</button></p>
        `,
    }),
};

