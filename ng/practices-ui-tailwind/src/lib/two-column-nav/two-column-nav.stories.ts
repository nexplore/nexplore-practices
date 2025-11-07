import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { PuiTwoColumnNavComponent } from './two-column-nav.component';

type Args = {
    heading: PuiTwoColumnNavComponent['heading'];
    headingSelectors: PuiTwoColumnNavComponent['headingSelectors'];
    aboveText?: string;
    belowText?: string;
};

const meta: Meta = {
    title: 'PUIBE/two-column-nav',
    component: PuiTwoColumnNavComponent,
    tags: ['layout', 'two-column', 'nav'],
    argTypes: {
        heading: { type: 'string' },
    },
    decorators: [
        moduleMetadata({
            imports: [PuiTwoColumnNavComponent, BrowserAnimationsModule],
        }),
    ],
    render: (args) => ({
        props: {
            ...args,
        },
        template: `
        <div class="bg-white pb-80 mb-4">
            <h1 class="italic p-3 text-gray">&lt;content&gt;</h1>
        </div>
        
        <pui-two-column-nav [heading]="heading" [headingSelectors]="headingSelectors">
            <p above-nav *ngIf="aboveText">{{ aboveText }}</p>
            <p below-nav *ngIf="belowText">{{ belowText }}</p>
            <div class="bg-white text-black px-3 m-0">
                <h1 id="heading-1" class="pt-3 pb-40">h1</h1>
                <p  class="pb-40">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
                <div class="h-px mx-5 block content-[''] bg-gray"></div>

                <h2 id="heading-2" class="pt-3 pb-40">h2 </h2>
                <p  class="pb-40">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
                <div class="h-px mx-5 block content-[''] bg-gray"></div>

                <h3 id="heading-3" class="pt-3 pb-40">h3</h3>
                <p  class="pb-40">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
                <div class="h-px mx-5 block content-[''] bg-gray"></div>

                <h4 id="heading-4" class="pt-3 pb-40">h4</h4>
                <p  class="pb-40">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
                <div class="h-px mx-5 block content-[''] bg-gray"></div>

                <h5 id="heading-5" class="pt-3 pb-40">h5</h5>
                <p  class="pb-40">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
                <div class="h-px mx-5 block content-[''] bg-gray"></div>

                <h6 id="heading-6" class="pt-3 pb-40">h6</h6>
                <p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
            </div>
        </pui-two-column-nav>

        <div class="bg-white pb-10 mt-4">
            <h1 class="italic p-3 text-gray">&lt;less content&gt;</h1>
        </div>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const DefaultTwoColumnLayout: Story = {
    args: {
        heading: 'Content',
        headingSelectors: [
            'h1#heading-1',
            'h2#heading-2',
            'h3#heading-3',
            'h4#heading-4',
            'h5#heading-5',
            'h6#heading-6',
        ],
    },
};

export const TwoColumnLayoutWithTextAboveAndBelow: Story = {
    args: {
        heading: 'Content',
        headingSelectors: [
            'h1#heading-1',
            'h2#heading-2',
            'h3#heading-3',
            'h4#heading-4',
            'h5#heading-5',
            'h6#heading-6',
        ],
        aboveText: 'Text above',
        belowText: 'Text below',
    },
};

export const TwoColumnLayoutWithCustomHeadingSelector: Story = {
    args: {
        heading: 'Content',
        headingSelectors: ['h1#heading-1', 'h3#heading-3'],
    },
};

export const MobileTwoColumnLayout: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
    args: {
        heading: 'Content',
        headingSelectors: [
            'h1#heading-1',
            'h2#heading-2',
            'h3#heading-3',
            'h4#heading-4',
            'h5#heading-5',
            'h6#heading-6',
        ],
    },
};

