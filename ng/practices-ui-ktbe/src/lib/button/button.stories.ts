import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PracticesKtbeTableComponentsModule } from '../../index';
import { PuibeIconGoNextComponent } from '../icons/icon-go-next.component';
import { PuibeIconHomeComponent } from '../icons/icon-home.component';
import { PuibeIconLoginComponent } from '../icons/icon-login.component';
import { PuibeIconSearchComponent } from '../icons/icon-search.component';
import { PuibeButtonArrowsComponent } from './button-arrows.component';
import { PuibeButtonSpinnerComponent } from './button-spinner.component';
import { PuibeButtonDirective } from './button.directive';

type Args = {};

const meta: Meta<Args> = {
    title: 'PUIBE/button',
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [
                PuibeButtonDirective,
                PuibeButtonArrowsComponent,
                PuibeButtonSpinnerComponent,
                PuibeIconLoginComponent,
                PuibeIconGoNextComponent,
                PuibeIconSearchComponent,
                PuibeIconHomeComponent,
                BrowserAnimationsModule,
                PracticesKtbeTableComponentsModule,
            ],
        }),
    ],
    render: () => ({}),
};

export default meta;

type Story = StoryObj<Args>;

export const PrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary">Button</button>`,
    }),
};

export const SecondaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton>Button</button>`,
    }),
};

export const DangerButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger">Button</button>`,
    }),
};

export const DangerPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary">Button</button>`,
    }),
};

export const AcceptButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept">Button</button>`,
    }),
};

export const AcceptPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary">Button</button>`,
    }),
};

export const PrimaryLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puibeButton variant="primary">Link</a>`,
    }),
};

export const SecondaryLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puibeButton>Link</a>`,
    }),
};

export const DangerLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puibeButton variant="danger">Link</a>`,
    }),
};

export const DangerPrimaryLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puibeButton variant="danger-primary">Link</a>`,
    }),
};

export const AcceptLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puibeButton variant="accept">Link</a>`,
    }),
};

export const AcceptPrimaryLinkButton: Story = {
    render: (_) => ({
        template: `<a href="https://google.com" target="_blank" puibeButton variant="accept-primary">Link</a>`,
    }),
};

export const DisabledPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" disabled>Button</button>`,
    }),
};

export const DisabledSecondaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton disabled>Button</button>`,
    }),
};

export const DisabledDangerButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger" disabled>Button</button>`,
    }),
};

export const DisabledDangerPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary" disabled>Button</button>`,
    }),
};

export const DisabledAcceptButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" disabled>Button</button>`,
    }),
};

export const DisabledAcceptPrimaryButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" disabled>Button</button>`,
    }),
};

export const ButtonWithIcon: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton>
            <puibe-icon-login class="w-5 h-4"></puibe-icon-login>
            Button
        </button>`,
    }),
};

export const PrimaryButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" [scaleOnHover]="false">
            <puibe-button-arrows variant="left-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};

export const SecondaryButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton [scaleOnHover]="false">
        <puibe-button-arrows variant="left-arrow">Button</puibe-button-arrows>
    </button>`,
    }),
};

export const DangerButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger" [scaleOnHover]="false">
            <puibe-button-arrows variant="left-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};

export const DangerPrimaryButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary" [scaleOnHover]="false">
            <puibe-button-arrows variant="left-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};

export const AcceptButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" [scaleOnHover]="false">
            <puibe-button-arrows variant="left-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};
export const AcceptPrimaryButtonWithLeftArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" [scaleOnHover]="false">
            <puibe-button-arrows variant="left-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};

export const PrimaryButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" [scaleOnHover]="false">
            <puibe-button-arrows variant="right-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};

export const SecondaryButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton [scaleOnHover]="false">
        <puibe-button-arrows variant="right-arrow">Button</puibe-button-arrows>
    </button>`,
    }),
};

export const DangerButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger" [scaleOnHover]="false">
            <puibe-button-arrows variant="right-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};

export const DangerPrimaryButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary" [scaleOnHover]="false">
            <puibe-button-arrows variant="right-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};

export const AcceptButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" [scaleOnHover]="false">
            <puibe-button-arrows variant="right-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};

export const AcceptPrimaryButtonWithRightArrow: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" [scaleOnHover]="false">
            <puibe-button-arrows variant="right-arrow">Button</puibe-button-arrows>
        </button>`,
    }),
};

export const PrimaryButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const SecondaryButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const DangerButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const DangerPrimaryButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const AcceptButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};
export const AcceptPrimaryButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const PrimaryButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" [busy]="true">
        Button
    </button>`,
    }),
};

export const SecondaryButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton [busy]="true">
        Button
    </button>`,
    }),
};

export const DangerButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger" [busy]="true">
        Button
    </button>`,
    }),
};

export const DangerParimaryButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary" [busy]="true">
        Button
    </button>`,
    }),
};

export const AcceptButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" [busy]="true">
        Button
    </button>`,
    }),
};

export const AcceptParimaryButtonBusyWithoutSpinner: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" [busy]="true">
        Button
    </button>`,
    }),
};

export const PrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" size="small">i</button>`,
    }),
};

export const SecondarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton size="small">
            <puibe-icon-search class="w-full"></puibe-icon-search>
        </button>`,
    }),
};

export const DangerSmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger" size="small">x</button>`,
    }),
};

export const DangerPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary" size="small">x</button>`,
    }),
};

export const AcceptSmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" size="small">✓</button>`,
    }),
};

export const AcceptPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" size="small">✓</button>`,
    }),
};

export const DisabledPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" size="small" disabled>i</button>`,
    }),
};

export const DisabledSecondarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton size="small" disabled>
            <puibe-icon-search class="w-full"></puibe-icon-search>
        </button>`,
    }),
};

export const DisabledDangerSmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger" size="small" disabled>x</button>`,
    }),
};

export const DisabledDangerPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary" size="small" disabled>x</button>`,
    }),
};

export const DisabledAcceptSmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" size="small" disabled>✓</button>`,
    }),
};

export const DisabledAcceptPrimarySmallButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" size="small" disabled>✓</button>`,
    }),
};

export const PrimarySmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" size="small" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const SecondarySmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton size="small" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const DangerSmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger" size="small" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const DangerPrimarySmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary" size="small" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const AcceptSmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" size="small" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const AcceptPrimarySmallButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" size="small" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};
export const BusyAndDisabledFalse: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton [busy]="true" [disabled]="false">
        <puibe-button-spinner>Button</puibe-button-spinner> Busy and disabled
    </button>`,
    }),
};

export const SmallButtonInTable: Story = {
    render: (_args) => ({
        props: {
            onActionClick: (act: number) => console.log('clicked col action', act),
        },
        template: `
        <puibe-table class="w-full">
            <puibe-table-column >H1</puibe-table-column>
            <puibe-table-column >H2</puibe-table-column>
            <puibe-table-column >H3</puibe-table-column>
            <puibe-table-column class="w-auto"></puibe-table-column>

            <puibe-table-row>
                <puibe-table-cell>A1</puibe-table-cell>
                <puibe-table-cell>A2</puibe-table-cell>
                <puibe-table-cell>A3</puibe-table-cell>
                <puibe-table-cell>
                    <puibe-table-col-actions>
                        <button puibeButton size="small" type="button" title="Details" aria-label="Details" (click)="onActionClick(1)"><puibe-icon-search size="s"></puibe-icon-search></button>
                        <button puibeButton variant="danger" size="small" type="button" title="Löschen" aria-label="Löschen">x</button>
                    </puibe-table-col-actions>
                </puibe-table-cell>
            </puibe-table-row>

            <puibe-table-row>
                <puibe-table-cell>B1</puibe-table-cell>
                <puibe-table-cell>B2</puibe-table-cell>
                <puibe-table-cell>B3</puibe-table-cell>
                <puibe-table-cell>
                    <puibe-table-col-actions>
                        <button puibeButton size="small" type="button" title="Details" aria-label="Details" (click)="onActionClick(2)"><puibe-icon-search size="s"></puibe-icon-search></button>
                        <button puibeButton variant="danger" size="small" type="button" title="Löschen" aria-label="Löschen">x</button>
                    </puibe-table-col-actions>
                </puibe-table-cell>
            </puibe-table-row>
        </puibe-table>`,
    }),
};

export const PrimaryLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" size="large-round">
            <puibe-icon-home size="m"></puibe-icon-home>
        </button>`,
    }),
};

export const SecondaryLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton size="large-round">
            <puibe-icon-search size="m"></puibe-icon-search>
        </button>`,
    }),
};

export const AcceptLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" size="large-round">✓</button>`,
    }),
};

export const AcceptPrimaryLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" size="large-round">✓</button>`,
    }),
};

export const DisabledAcceptLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" size="large-round" disabled>✓</button>`,
    }),
};

export const DisabledAcceptPrimaryLargeRoundButton: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" size="large-round" disabled>✓</button>`,
    }),
};

export const PrimaryLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="primary" size="large-round" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const SecondaryLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton size="large-round" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const DangerLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger" size="large-round" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const DangerPrimaryLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="danger-primary" size="large-round" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const AcceptLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept" size="large-round" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const AcceptPrimaryLargeRoundButtonBusy: Story = {
    render: (_) => ({
        template: `<button type="button" puibeButton variant="accept-primary" size="large-round" [busy]="true">
        <puibe-button-spinner>Button</puibe-button-spinner>
    </button>`,
    }),
};

export const AnimationSmoothing: Story = {
    render: (_) => ({
        template: `
        <p>Without smooth animation transform: <button type="button" puibeButton variant="primary" [disableSmoothAnimationTransform]="true">   <puibe-icon-login class="w-5 h-4"></puibe-icon-login> Button</button></p>
        <p class="pt-1">With smooth animation transform: <button type="button" puibeButton variant="primary">   <puibe-icon-login class="w-5 h-4"></puibe-icon-login> Button</button></p>
        `,
    }),
};
