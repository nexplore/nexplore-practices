import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { command } from '@nexplore/practices-ng-commands';
import { LegacyCommand } from '@nexplore/practices-ui';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { map, timer } from 'rxjs';
import { PuibeButtonArrowsComponent } from '../button/button-arrows.component';
import { PuibeButtonSpinnerComponent } from '../button/button-spinner.component';
import { PuibeButtonDirective } from '../button/button.directive';
import { PuibeIconGoNextComponent } from '../icons/icon-go-next.component';
import { PuibeIconLoginComponent } from '../icons/icon-login.component';
import { PuibeIconSearchComponent } from '../icons/icon-search.component';
import { PuibeStatusHubComponent } from '../status-hub/status-hub.component';
import { PuibeClickCommandDirective } from './click-command.directive';

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
                PuibeButtonDirective,
                PuibeButtonArrowsComponent,
                PuibeButtonSpinnerComponent,
                PuibeIconLoginComponent,
                PuibeIconGoNextComponent,
                PuibeIconSearchComponent,
                BrowserAnimationsModule,
                PuibeClickCommandDirective,
                PuibeStatusHubComponent,
            ],
        }),
    ],
    render: () => ({}),
};

export default meta;

type Story = StoryObj<Args>;

const defaultTmpl = (args: Args) => `${args.enableStatusHub ? `<puibe-status-hub></puibe-status-hub>` : ``}`;

export const SimpleClickCommand: Story = {
    render: (args) => ({
        props: {
            command: LegacyCommand.create(() => timer(1500)),
        },
        template: `${defaultTmpl(args)}
        <button type="button" puibeButton [clickCommand]="command">Button</button>`,
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
                { status: { successMessage: 'Yeah it worked!' } }
            ),
            blockingCommand: LegacyCommand.create(
                () => {
                    return timer(4000);
                },
                { blocking: true }
            ),
            msgCommand: LegacyCommand.create(
                () => {
                    return timer(6000);
                },
                {
                    progressMessage: 'Please wait...',
                }
            ),
            blockingMsgCommand: LegacyCommand.create(
                () => {
                    return timer(6000);
                },
                {
                    blocking: true,
                    progressMessage: 'Please wait...',
                    successMessage: 'The long blocking operation is finally finished!',
                }
            ),
            errorCommand: LegacyCommand.create(() => {
                throw new Error('I threw immedeately! ' + Math.random());
            }),
            errorAsyncCommand: LegacyCommand.create(() => {
                return timer(1000).pipe(
                    map((_) => {
                        throw new Error('Here is your error!');
                    })
                );
            }),

            withParam: LegacyCommand.create(
                (params: { text: string }) =>
                    timer(1000).pipe(
                        map((_) => {
                            return params.text;
                        })
                    ),
                { successMessage: (text) => `The result is "${text}"` }
            ),
        },
        template: `${defaultTmpl(args)}
        <button type="button" puibeButton [clickCommand]="simpleCommand">Simple Progress</button>
        <button type="button" puibeButton [clickCommand]="successCommand">Success Message</button>
        <button type="button" puibeButton [clickCommand]="blockingCommand">Block ui</button>
        <button type="button" puibeButton [clickCommand]="msgCommand">Progress Message</button>
        <button type="button" puibeButton [clickCommand]="blockingMsgCommand">Progress Message (blocking)</button>
        <button type="button" puibeButton [clickCommand]="errorAsyncCommand">Throw Error Async</button>
        <button type="button" puibeButton [clickCommand]="errorCommand">Throw Error</button>
        <button type="button" puibeButton [clickCommand]="withParam" [commandArgs]="{text: '42'}">With params</button>
        `,
    }),
};
