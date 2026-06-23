import { FormsModule } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeHideIfEmptyTextDirective } from './hide-if-empty-text.directive';
import { ComponentWithEntraceAnimation } from './hide-if-empty-text.stories.with-entrance-animation';
import { ComponentProjectedChild, ComponentWrapper } from './hide-if-empty-text.stories.with-projected-child';

type Args = {};

const meta: Meta<Args> = {
    title: 'PUIBE/hide-if-empty-text',
    decorators: [
        moduleMetadata({
            imports: [PuibeHideIfEmptyTextDirective, FormsModule, ComponentProjectedChild, ComponentWrapper],
            declarations: [ComponentWithEntraceAnimation],
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
                <p>Content goes here (always visible)</p>
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

export const WithEntranceAnimation: Story = {
    args: {},
    render: (args) => {
        return {
            props: {
                ...args,
                show: true,
            },
            template: `
            <div class="flex flex-col min-h-96 min-w-96 gap-4">
                <button (click)="show = !show" class="p-6 bg-light-gray rounded-full cursor-pointer hover:shadow-inner transition-all border border-gray">toggle content</button>
                <p>Is empty: {{isEmpty}}</p>
                <div puibeHideIfEmptyText (emptyTextChange)="isEmpty = $event">

                    <component-with-entrace-animation [show]="show"/>

                </div>
            </div>`,
        };
    },
};

export const WithEntranceAnimationAndNestedDirectives: Story = {
    args: {},
    render: (args) => {
        return {
            props: {
                ...args,
                show: true,
            },
            template: `
            <div class="flex flex-col min-h-96 min-w-96 gap-4">
                <button (click)="show = !show" class="p-6 bg-light-gray rounded-full cursor-pointer hover:shadow-inner transition-all border border-gray">toggle content</button>
                <p>Is child empty: {{isEmpty}}, Is parent empty: {{isParentEmpty}}</p>
                <div puibeHideIfEmptyText (emptyTextChange)="isParentEmpty = $event">
                    <div puibeHideIfEmptyText (emptyTextChange)="isEmpty = $event">

                        <component-with-entrace-animation [show]="show"/>

                    </div>
                </div>
            </div>`,
        };
    },
};

export const WithWrapperAndProjectedChildDirective: Story = {
    args: {},
    render: (args) => {
        return {
            props: {
                ...args,
                show: false,
                isEmpty: undefined,
                isParentEmpty: undefined,
            },
            template: `
            <div class="flex flex-col min-h-96 min-w-96 gap-4">
                <button (click)="show = !show" class="p-6 bg-light-gray rounded-full cursor-pointer hover:shadow-inner transition-all border border-gray">toggle content with delay</button>
                <p>Projected child empty: {{isEmpty}}, Wrapper empty: {{isParentEmpty}}</p>

                <component-wrapper (emptyTextChange)="isParentEmpty = $event">

                    @if (show) {
                        <component-projected-child [show]="show" (emptyTextChange)="isEmpty = $event"/>
                    } @else {
                        <span class="text-gray-500 italic">Projected content removed</span>
                    }

                </component-wrapper>
            </div>`,
        };
    },
};
