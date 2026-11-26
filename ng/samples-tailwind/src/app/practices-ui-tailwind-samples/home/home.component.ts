
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PuiPanelComponent, PuiTeaserComponent } from '@nexplore/practices-ui-tailwind';

interface ComponentExample {
    title: string;
    route: string;
    description: string;
    icon?: string;
}

interface ComponentCategory {
    name: string;
    icon: string;
    components: ComponentExample[];
}

@Component({
    standalone: true,
    selector: 'app-tables',
    templateUrl: './home.component.html',
    imports: [PuiPanelComponent, PuiTeaserComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
    categories: ComponentCategory[] = [
        {
            name: 'Layout & Typography',
            icon: 'layout',
            components: [
                {
                    title: 'Typography',
                    route: '/typography',
                    description: 'Text styles, headings, paragraphs, and other typography elements',
                },
                {
                    title: 'Expansion Panels',
                    route: '/expansion-panels',
                    description: 'Expandable content containers for organizing information',
                },
                {
                    title: 'Tabs',
                    route: '/tabs',
                    description: 'Tabbed interface for organizing content in a compact space',
                },
            ],
        },
        {
            name: 'Form Controls',
            icon: 'form',
            components: [
                {
                    title: 'Form Elements',
                    route: '/form-elements',
                    description: 'Input fields, labels, and other form controls',
                },
                {
                    title: 'Form with Hide Invalid',
                    route: '/form-with-hide-invalid',
                    description: 'Only show when touched',
                },
                {
                    title: 'Buttons',
                    route: '/buttons',
                    description: 'Various button styles and states',
                },
                {
                    title: 'Radio Buttons',
                    route: '/radio-buttons',
                    description: 'Radio button selection controls',
                },
                {
                    title: 'Checkboxes',
                    route: '/checkboxes',
                    description: 'Checkbox controls for multi-selection',
                },
            ],
        },
        {
            name: 'Data Display',
            icon: 'table',
            components: [
                {
                    title: 'Tables',
                    route: '/tables',
                    description: 'Data tables with sorting and pagination',
                },
                {
                    title: 'Tables with Infinite Scrolling',
                    route: '/tables-infinite-scrolling',
                    description: 'Tables with infinite scrolling pagination',
                },
            ],
        },
        {
            name: 'Feedback & Notifications',
            icon: 'notification',
            components: [
                {
                    title: 'Toasts',
                    route: '/toasts',
                    description: 'Toast notifications for user feedback',
                },
                {
                    title: 'Popups',
                    route: '/popups',
                    description: 'Modal dialogs and popup panels',
                },
                {
                    title: 'Status Hub',
                    route: '/status-hub',
                    description: 'Central status management for operations',
                },
            ],
        },
        {
            name: 'Navigation',
            icon: 'navigation',
            components: [
                {
                    title: 'Breadcrumb',
                    route: '/breadcrumb',
                    description: 'Breadcrumb navigation for hierarchical page structure',
                },
                {
                    title: 'Lazy Loading',
                    route: '/lazy',
                    description: 'Example of lazy loaded routes',
                },
            ],
        },
        {
            name: 'Other',
            icon: 'more',
            components: [
                {
                    title: 'Timeline',
                    route: '/timeline',
                    description: 'Vertical timeline component',
                },
                {
                    title: 'Sidepanel',
                    route: '/sidepanel',
                    description: 'collapsible sidepanel to display additional information',
                },
                {
                    title: 'Miscellaneous',
                    route: '/misc',
                    description: 'Various utility components and directives',
                },
            ],
        },
    ];
}

