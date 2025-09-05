import { FormsModule } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeHideIfEmptyTextDirective } from './hide-if-empty-text.directive';

type Args = {};

const meta: Meta<Args> = {
    title: 'PUIBE/hide-if-empty-text',
    decorators: [
        moduleMetadata({
            imports: [PuibeHideIfEmptyTextDirective, FormsModule],
        }),
    ],
    render: (args) => {
        return {
            props: {
                ...args,
                model: '',
            },
            template: `<div>
                <textarea [(ngModel)]="content" placeholder="Type here..." ></textarea>

                <br/>
                <p>Content goes here</p>
                <hr/>

                <pre class="bg-red text-white p-10" >{{content}}</pre>
                <br/>
                <p>Following content will only be visible if not empty</p>
                <hr/>
                <pre class="bg-green text-white p-10" puibeHideIfEmptyText>{{content}}</pre>
                </div>`,
        };
    },
};

export default meta;

type Story = StoryObj<Args>;

export const Basic: Story = {
    args: {},
};
