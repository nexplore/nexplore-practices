import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PuiFormularInvalidError } from '@nexplore/practices-ng-forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeStatusToastComponent } from './status-toast.component';

type Args = {
    status: any;
};

/** An error with a fixed stack, so the details render the same every time. */
function errorWithStack(message: string) {
    const error = new Error(message);
    error.stack = `Error: ${message}\n    at loadData (data.service.ts:42:15)\n    at submit (form.component.ts:17:9)`;
    return error;
}

const meta: Meta<Args> = {
    title: 'PUIBE/status-toast',
    component: PuibeStatusToastComponent,
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [PuibeStatusToastComponent, BrowserAnimationsModule],
        }),
    ],
    render: (args) => ({
        props: args,
        template: `<puibe-status-toast [status]="status"></puibe-status-toast>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const Success: Story = {
    args: { status: { success: 'Die Daten wurden gespeichert.' } },
};

export const ErrorMessage: Story = {
    args: { status: { error: { message: 'Die Daten konnten nicht geladen werden.' } } },
};

export const ErrorWithDetails: Story = {
    args: { status: { error: errorWithStack('Der Server hat nicht geantwortet.') } },
};

export const FormularInvalid: Story = {
    args: { status: { error: new PuiFormularInvalidError() } },
};
