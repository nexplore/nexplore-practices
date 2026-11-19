import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { PuibeExpansionPanelComponent } from '../expansion-panel/expansion-panel.component';
import { PuibeTimelineItemComponent } from './timeline-item/timeline-item.component';
import { PuibeTimelineComponent } from './timeline.component';

type Args = {
    alignment: 'left' | 'right';
};

const meta: Meta<Args> = {
    title: 'PUIBE/timeline',
    component: PuibeTimelineComponent,
    tags: ['autodocs'],
    argTypes: {
        alignment: { control: 'radio', options: ['left', 'right'] },
    },
    decorators: [
        moduleMetadata({
            imports: [
                PuibeTimelineComponent,
                PuibeTimelineItemComponent,
                PuibeExpansionPanelComponent,
                BrowserAnimationsModule,
            ],
        }),
    ],
    render: (args) => ({
        props: args,
        template: `
        <puibe-timeline [alignment]="alignment">
            <puibe-timeline-item>
                <h3>Gesuch eingereicht</h3>
                <p>Ihr Gesuch ist am 14.03.2025 bei uns eingegangen.</p>
            </puibe-timeline-item>
            <puibe-timeline-item>
                <puibe-expansion-panel heading="In Prüfung" headingLevel="3" [isExpanded]="true" variant="sand">
                    <p>Die Unterlagen werden von der zuständigen Stelle geprüft.</p>
                </puibe-expansion-panel>
            </puibe-timeline-item>
            <puibe-timeline-item>
                <h3>Entscheid</h3>
                <p>Sie erhalten den Entscheid per Post.</p>
            </puibe-timeline-item>
        </puibe-timeline>`,
    }),
};

export default meta;

type Story = StoryObj<Args>;

export const LeftAligned: Story = {
    args: { alignment: 'left' },
};

export const RightAligned: Story = {
    args: { alignment: 'right' },
};
