import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { PuibeToastComponent } from './toast.component';

type Args = {
    text: string;
    actions: any[];
    closeable: boolean;
    variant?: 'default' | 'success' | 'error' | 'info';
    showAlertIcon: boolean;
};

const meta: Meta<Args> = {
    title: 'PUIBE/toast',
    component: PuibeToastComponent,
    tags: ['autodocs'],
    argTypes: {},
    decorators: [
        moduleMetadata({
            imports: [PuibeToastComponent, BrowserAnimationsModule],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <puibe-toast [closeable]="closeable" [variant]="variant" [showAlertIcon]="showAlertIcon">
            ${args.text}
            <button puibeToastAction *ngFor="let action of actions;">
                {{ action.text }}
            </button>
        </puibe-toast>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const ToastDefaultCloseable: Story = {
    args: {
        variant: 'default',
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        actions: [{ text: 'Zurück zur Startseite' }],
        closeable: true,
    },
};
export const ToastErrorCloseable: Story = {
    args: {
        variant: 'error',
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        actions: [{ text: 'Zurück zur Startseite' }, { text: 'weitere Aktionen' }],
        closeable: true,
    },
};
export const ToastInfoCloseable: Story = {
    args: {
        variant: 'info',
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        actions: [{ text: 'Zurück zur Startseite' }, { text: 'weitere Aktionen' }],
        closeable: true,
    },
};
export const ToastSuccessCloseable: Story = {
    args: {
        variant: 'success',
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        actions: [{ text: 'Zurück zur Startseite' }, { text: 'weitere Aktionen' }],
        closeable: true,
    },
};

export const ToastDefault: Story = {
    args: {
        variant: 'default',
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        actions: [{ text: 'Zurück zur Startseite' }],
        closeable: false,
    },
};
export const ToastError: Story = {
    args: {
        variant: 'error',
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        actions: [{ text: 'Zurück zur Startseite' }],
        closeable: false,
    },
};
export const ToastInfo: Story = {
    args: {
        variant: 'info',
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        actions: [{ text: 'Zurück zur Startseite' }],
        closeable: false,
    },
};
export const ToastSuccess: Story = {
    args: {
        variant: 'success',
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        actions: [{ text: 'Zurück zur Startseite' }],
        closeable: false,
    },
};

export const ToastDefaultWithoutActionsMultiline: Story = {
    args: {
        variant: 'default',
        text: `<p >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p><p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>`,
        closeable: true,
    },
};

export const ToastDefaultMultiline: Story = {
    args: {
        variant: 'default',
        text: `<p class="text-h4">Lorem ipsum dolor sit amet</p><p>consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        closeable: true,
        actions: [{ text: 'Mehr Details' }],
    },
};

export const AlertToastDefault: Story = {
    args: {
        variant: 'default',
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
        closeable: false,
        showAlertIcon: true,
    },
};
export const AlertToastError: Story = {
    args: {
        variant: 'error',
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
        closeable: false,
        showAlertIcon: true,
    },
};
export const AlertToastInfo: Story = {
    args: {
        variant: 'info',
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
        closeable: false,
        showAlertIcon: true,
    },
};
export const AlertToastSuccess: Story = {
    args: {
        variant: 'success',
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
        closeable: false,
        showAlertIcon: true,
    },
};
export const AlertToastDefaultCloseable: Story = {
    args: {
        variant: 'default',
        text: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
        actions: [{ text: 'Zurück zur Startseite' }],
        closeable: true,
        showAlertIcon: true,
    },
};
