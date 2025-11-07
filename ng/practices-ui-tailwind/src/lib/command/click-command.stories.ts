import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { command } from '@nexplore/practices-ng-commands';
import { LegacyCommand } from '@nexplore/practices-ui';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { map, timer } from 'rxjs';
import { PuiButtonArrowsComponent } from '../button/button-arrows.component';
import { PuiButtonSpinnerComponent } from '../button/button-spinner.component';
import { PuiButtonDirective } from '../button/button.directive';
import { PuiIconGoNextComponent } from '../icons/icon-go-next.component';
import { PuiIconLoginComponent } from '../icons/icon-login.component';
import { PuiIconSearchComponent } from '../icons/icon-search.component';
import { PuiStatusHubComponent } from '../status-hub/status-hub.component';
import { PuiClickCommandDirective } from './click-command.directive';

type Args = {
    enableStatusHub: boolean;
};

const meta: Meta<Args> = {
    title: 'PUIBE/click-command',
    tags: ['autodocs'],
    argTypes: {
        enableStatusHub: { type: 'boolean', defaultValue: true },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuiButtonDirective,
                PuiButtonArrowsComponent,
                PuiButtonSpinnerComponent,
                PuiIconLoginComponent,
                PuiIconGoNextComponent,
                PuiIconSearchComponent,
                BrowserAnimationsModule,
                PuiClickCommandDirective,
                PuiStatusHubComponent,
            ],
        }),
    ],
    render: () => ({}),
};

export default meta;

type Story = StoryObj<Args>;

const defaultTmpl = (args: Args) => `${args.enableStatusHub ? `<pui-status-hub></pui-status-hub>` : ``}`;

export const SimpleClickCommand: Story = {
    render: (args) => ({
        props: {
            command: LegacyCommand.create(() => timer(1500)),
        },
        template: `${defaultTmpl(args)}
        <button type="button" puiButton [clickCommand]="command">Button</button>`,
    }),
};

export const WithStatus: Story = {
    args: { enableStatusHub: true },
    render: (args) => ({
        props: {
            simpleCommand: command.action(() => {
                return timer(3000);
            }),
            successCommand: command.action(
                () => {
                    return timer(1000);
                },
                { status: { successMessage: 'Yeah it worked!' } },
            ),
            blockingCommand: LegacyCommand.create(
                () => {
                    return timer(4000);
                },
                { blocking: true },
            ),
            msgCommand: LegacyCommand.create(
                () => {
                    return timer(6000);
                },
                {
                    progressMessage: 'Please wait...',
                },
            ),
            blockingMsgCommand: LegacyCommand.create(
                () => {
                    return timer(6000);
                },
                {
                    blocking: true,
                    progressMessage: 'Please wait...',
                    successMessage: 'The long blocking operation is finally finished!',
                },
            ),
            errorCommand: LegacyCommand.create(() => {
                throw new Error('I threw immedeately! ' + Math.random());
            }),
            errorAsyncCommand: LegacyCommand.create(() => {
                return timer(1000).pipe(
                    map((_) => {
                        throw new Error('Here is your error!');
                    }),
                );
            }),

            withParam: LegacyCommand.create(
                (params: { text: string }) =>
                    timer(1000).pipe(
                        map((_) => {
                            return params.text;
                        }),
                    ),
                { successMessage: (text) => `The result is "${text}"` },
            ),
        },
        template: `${defaultTmpl(args)}
        <button type="button" puiButton [clickCommand]="simpleCommand">Simple Progress</button>
        <button type="button" puiButton [clickCommand]="successCommand">Success Message</button>
        <button type="button" puiButton [clickCommand]="blockingCommand">Block ui</button>
        <button type="button" puiButton [clickCommand]="msgCommand">Progress Message</button>
        <button type="button" puiButton [clickCommand]="blockingMsgCommand">Progress Message (blocking)</button>
        <button type="button" puiButton [clickCommand]="errorAsyncCommand">Throw Error Async</button>
        <button type="button" puiButton [clickCommand]="errorCommand">Throw Error</button>
        <button type="button" puiButton [clickCommand]="withParam" [commandArgs]="{text: '42'}">With params</button>
        `,
    }),
};

