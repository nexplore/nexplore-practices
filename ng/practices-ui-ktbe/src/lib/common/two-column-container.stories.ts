import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuibeTwoColumnLayoutComponent } from './two-column-container.component';

type Args = {
    mobileOrder?: PuibeTwoColumnLayoutComponent['mobileOrder'];
    horizontalDistribution?: PuibeTwoColumnLayoutComponent['horizontalDistribution'];
};

const meta: Meta = {
    title: 'PUIBE/two-column',
    component: PuibeTwoColumnLayoutComponent,
    tags: ['layout', 'two-column'],
    argTypes: {
        mobileOrder: {
            type: { name: 'enum', value: ['left first', 'right first'] },
            defaultValue: 'right first',
        },
        horizontalDistribution: {
            type: { name: 'enum', value: ['50/50', '66/33'] },
            defaultValue: '66/33',
        },
    },
    decorators: [
        moduleMetadata({
            imports: [PuibeTwoColumnLayoutComponent],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <puibe-two-column [mobileOrder]="mobileOrder" [horizontalDistribution]="horizontalDistribution">
            <div left-column class="bg-white text-black p-3 m-0 drop-shadow-md rounded">
                <h2>Left column content</h2>
                <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
            </div>
            <div right-column class="bg-white text-black p-3 m-0 drop-shadow-md rounded">
                <h2>Right column content</h2>
                <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
            </div>
        </puibe-two-column>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const DefaultTwoColumnLayout: Story = {
    parameters: {
        options: {
            withKnobs: false,
        },
    },
    args: {
        mobileOrder: 'right first',
        horizontalDistribution: '66/33',
    },
};

export const DefaultMobileTwoColumnLayout: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
    args: {
        mobileOrder: 'right first',
        horizontalDistribution: '66/33',
    },
};

export const FiftyFiftyTwoColumnLayout: Story = {
    parameters: {
        options: {
            withKnobs: false,
        },
    },
    args: {
        mobileOrder: 'right first',
        horizontalDistribution: '50/50',
    },
};

export const LeftFirstMobileTwoColumnLayout: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
    args: {
        mobileOrder: 'left first',
        horizontalDistribution: '66/33',
    },
};
