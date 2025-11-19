# Practices.Ui.Tailwind

Component library built with Angular and Tailwind CSS.

**Add components as source to your own app** with the provided Angular schematic. Run `ng add @nexplore/practices-ui-tailwind` to be guided through selecting the components, styles, and supporting files you want to scaffold directly into your project.

See [Schematics Readme](./schematics/README.md) for more details on tooling.

## Overview

This library provides a comprehensive set of Angular components, directives, and services. It uses Tailwind CSS for styling and Angular CDK for enhanced functionality.

## Key Features

- **Fully styled UI components** easily themable
- **Standalone components** for easy integration with Angular applications
- **Responsive design** supporting various screen sizes
- **Accessibility support** for inclusive user experiences
- **Tailwind CSS integration** for consistent styling
- **Type-safe interfaces** for improved developer experience

## Core Components

### Layout Components

- [Shell components](./src/lib/shell/shell.component.ts) - Application layout structure
- [Two-column container](./src/lib/common/two-column-container.component.ts) - Flexible layout patterns ([Storybook](./src/lib/common/two-column-container.stories.ts))
- [Header](./src/lib/header/header.component.ts) - Header component ([Storybook](./src/lib/header/header.stories.ts))
- [Footer](./src/lib/footer/footer.component.ts) - Footer component
- [Skip Link](./src/lib/skip-link/skip-link.component.ts) - Accessibility feature to skip to main content

- [Shell components](./src/lib/shell/shell.component.ts) - Application layout structure
- [Two-column container](./src/lib/common/two-column-container.component.ts) - Flexible layout patterns ([Storybook](./src/lib/common/two-column-container.stories.ts))
- [Header](./src/lib/header/header.component.ts) - Header component ([Storybook](./src/lib/header/header.stories.ts))
- [Footer](./src/lib/footer/footer.component.ts) - Footer component
- [Skip Link](./src/lib/skip-link/skip-link.component.ts) - Accessibility feature to skip to main content

### Navigation Components

- [Breadcrumb](./src/lib/breadcrumb/breadcrumb.component.ts) - Path-based navigation ([Storybook](./src/lib/breadcrumb/breadcrumb.stories.ts))
- [Side Navigation](./src/lib/side-navigation/side-navigation.component.ts) - Collapsible side menu ([Storybook](./src/lib/side-navigation/side-navigation.stories.ts))
- [Tabs](./src/lib/tabs/tabs.component.ts) - Tabbed interface ([Storybook](./src/lib/tabs/tabs.stories.ts))
- [Step Box](./src/lib/step-box/step-box.component.ts) - Step-by-step progression indicator ([Storybook](./src/lib/step-box/step-box.stories.ts))
- [Arrow Link](./src/lib/link/arrow-link.component.ts) - Links with arrow indicators

### Display Components

- [Timeline](./src/lib/timeline/timeline.component.ts) – Vertical timeline layout with optional left/right alignment, used to visually represent events in chronological order

### Form Components

- [Teaser](./src/lib/teaser/teaser.component.ts) - Content preview ([Storybook](./src/lib/teaser/teaser.stories.ts))
- [Two-column navigation](./src/lib/two-column-nav/two-column-nav.component.ts) - Split-view navigation layout ([Storybook](./src/lib/two-column-nav/two-column-nav.stories.ts))
- [Table Hover Emphasis](./src/lib/table/cell/hover-emphasis.directive.ts) - Highlights columns on hover

- [Teaser](./src/lib/teaser/teaser.component.ts) - Content preview ([Storybook](./src/lib/teaser/teaser.stories.ts))
- [Two-column navigation](./src/lib/two-column-nav/two-column-nav.component.ts) - Split-view navigation layout ([Storybook](./src/lib/two-column-nav/two-column-nav.stories.ts))
- [Table Hover Emphasis](./src/lib/table/cell/hover-emphasis.directive.ts) - Highlights columns on hover

### Feedback & Status

- [Status Hub](./src/lib/status-hub/status-hub.component.ts) - Central status management for providing user feedback ([Storybook](./src/lib/status-hub/status-hub.stories.ts))
- [Toast](./src/lib/toast/toast.component.ts) - Notification messages ([Storybook](./src/lib/toast/toast.stories.ts))
- [Modal](./src/lib/popup/modal.component.ts) and [Flyout](./src/lib/popup/flyout.component.ts) - Dialog interfaces ([Storybook](./src/lib/popup/popups.stories.ts))
- [Action Dialog](./src/lib/popup/action-dialog.service.ts) - Pre-configured confirmation dialogs ([Storybook](./src/lib/popup/action-dialog.stories.ts))
- [In-page Search](./src/lib/inpage-search/inpage-search.component.ts) - Search within the current page ([Storybook](./src/lib/inpage-search/inpage-search.stories.ts))
- [Side Overlay Panel](./src/lib/side-overlay-panel/side-overlay-panel.service.ts) – Service-based slide-in panel for contextual content or workflows, supporting dynamic content injection, title translation, and full lifecycle management via Angular CDK overlay

- [Status Hub](./src/lib/status-hub/status-hub.component.ts) - Central status management for providing user feedback ([Storybook](./src/lib/status-hub/status-hub.stories.ts))
- [Toast](./src/lib/toast/toast.component.ts) - Notification messages ([Storybook](./src/lib/toast/toast.stories.ts))
- [Modal](./src/lib/popup/modal.component.ts) and [Flyout](./src/lib/popup/flyout.component.ts) - Dialog interfaces ([Storybook](./src/lib/popup/popups.stories.ts))
- [Action Dialog](./src/lib/popup/action-dialog.service.ts) - Pre-configured confirmation dialogs ([Storybook](./src/lib/popup/action-dialog.stories.ts))
- [In-page Search](./src/lib/inpage-search/inpage-search.component.ts) - Search within the current page ([Storybook](./src/lib/inpage-search/inpage-search.stories.ts))

### Buttons & Interactions

- [Button](./src/lib/button/button.directive.ts) - Standard and variant buttons ([Storybook](./src/lib/button/button.stories.ts))
- [Button Arrows](./src/lib/button/button-arrows.component.ts) - Buttons with directional arrows
- [Button Spinner](./src/lib/button/button-spinner.component.ts) - Loading indicator for buttons
- [Dropdown Button](./src/lib/dropdown-button/dropdown-button.component.ts) - Button with dropdown menu
- [Selection](./src/lib/selection/index.ts) - Components for item selection

- [Button](./src/lib/button/button.directive.ts) - Standard and variant buttons ([Storybook](./src/lib/button/button.stories.ts))
- [Button Arrows](./src/lib/button/button-arrows.component.ts) - Buttons with directional arrows
- [Button Spinner](./src/lib/button/button-spinner.component.ts) - Loading indicator for buttons
- [Dropdown Button](./src/lib/dropdown-button/dropdown-button.component.ts) - Button with dropdown menu
- [Selection](./src/lib/selection/index.ts) - Components for item selection

### Icons

The library includes a basic set of svg-based icons:

- Navigation icons (arrows, hamburger menu, home)
- Action icons (edit, download, upload)
- Status icons (valid, invalid, spinner)
- Enumeration icon (displays numbers as icons)
- And many more

- Navigation icons (arrows, hamburger menu, home)
- Action icons (edit, download, upload)
- Status icons (valid, invalid, spinner)
- Enumeration icon (displays numbers as icons)
- And many more

### Utility Directives

- [Hide If Empty Text](./src/lib/util/hide-if-empty-text.directive.ts) - Hides elements with empty text ([Storybook](./src/lib/util/hide-if-empty-text.stories.ts))
- [Observe Screen Position](./src/lib/util/observe-screen-position.directive.ts) - Track element position
- [Observe Scroll Position](./src/lib/util/observe-scroll-position.directive.ts) - Track scroll events
- [Observe Size](./src/lib/util/observe-size.directive.ts) - Track element size changes
- [Sticky](./src/lib/util/sticky.directive.ts) - Create sticky positioned elements
- [Add Title If Ellipsis](./src/lib/util/add-title-if-ellipsis.directive.ts) - Auto-add title attributes

- [Hide If Empty Text](./src/lib/util/hide-if-empty-text.directive.ts) - Hides elements with empty text ([Storybook](./src/lib/util/hide-if-empty-text.stories.ts))
- [Observe Screen Position](./src/lib/util/observe-screen-position.directive.ts) - Track element position
- [Observe Scroll Position](./src/lib/util/observe-scroll-position.directive.ts) - Track scroll events
- [Observe Size](./src/lib/util/observe-size.directive.ts) - Track element size changes
- [Sticky](./src/lib/util/sticky.directive.ts) - Create sticky positioned elements
- [Add Title If Ellipsis](./src/lib/util/add-title-if-ellipsis.directive.ts) - Auto-add title attributes

## Installation

```bash
pnpm install @nexplore/practices-ui-tailwind
```

## Usage

### Basic Setup

To use the Nexplore Practices Tailwind UI library in your Angular application, you need to properly configure it in your application's bootstrap process:

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePractices } from '@nexplore/practices-ui';
import { PracticesTailwindShellModule, providePracticesTailwind } from '@nexplore/practices-ui-tailwind';
import { TranslateModule } from '@ngx-translate/core';

import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(APP_ROUTES),
        importProvidersFrom(TranslateModule.forRoot(), BrowserAnimationsModule, PracticesTailwindShellModule),
        // Configure the core Practices services
        providePractices({
            rewriteResourceConfig: {
                rewriteTypeConfig: {
                    Base: {
                        rewriteTo: 'Other',
                        fallbackTo: 'Fallback',
                    },
                },
            },
            titleServiceConfig: {
                titleTransformer: (title) => title + ' | My Application',
                autoSetBreadcrumbTitle: true,
                localize: true,
            },
        }),
        // Enable the Nexplore Practices Tailwind UI components
        providePracticesTailwind(),
    ],
});
```

### Application Shell Setup

The library provides a comprehensive shell layout including header, footer, and navigation components:

```typescript
// app.component.ts
import { Component } from '@angular/core';
import {
    PuiShellComponent,
    PuiHeaderComponent,
    PuiHeaderDirective,
    PuiFooterComponent,
    PuiFooterDirective,
    PuiStatusHubComponent,
    PuiGlobalDirtyGuardDirective,
    // Import other needed components
} from '@nexplore/practices-ui-tailwind';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        PuiShellComponent,
        PuiHeaderComponent,
        PuiHeaderDirective,
        PuiFooterComponent,
        PuiFooterDirective,
        PuiStatusHubComponent,
        PuiGlobalDirtyGuardDirective,
        // Add other imports
    ],
    template: `
        <pui-shell [stickyBreadcrumbs]="true">
            <pui-header puiHeader logoLink="/" logoImage="/assets/logo.svg" logoCaption="My Application">
                <!-- Header content here -->
            </pui-header>

            <main>
                <!-- Add the puiGlobalDirtyGuard directive to protect navigation when forms have unsaved changes -->
                <router-outlet puiGlobalDirtyGuard></router-outlet>
            </main>

            <pui-footer puiFooter>
                <span puiFooterCopyright>© 2025 - My Organization</span>
                <!-- Footer links -->
            </pui-footer>
        </pui-shell>

        <pui-status-hub></pui-status-hub>
    `,
})
export class AppComponent {
    // Component logic
}
```

#### Navigation Protection with Global Dirty Guard

The `puiGlobalDirtyGuard` directive provides built-in protection for forms with unsaved changes. When applied to a router-outlet, it will:

1. Detect forms with unsaved changes (dirty state) in the current route
2. Prompt users with a confirmation dialog when they attempt to navigate away from a page with unsaved changes
3. Allow users to either cancel navigation or proceed and discard changes

```html
<!-- Apply the directive to your router-outlet -->
<router-outlet puiGlobalDirtyGuard></router-outlet>
```

### Form Components

The library provides a comprehensive set of form components styled according to the Nexplore Practices Tailwind design system:

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { formGroup } from '@nexplore/practices-ng-forms';
import { command } from '@nexplore/practices-ng-commands';
import { HttpClient } from '@angular/common/http';
import {
  PracticesTailwindFormComponentsModule,
  PuiButtonDirective,
  PuiFormDirective,
  PuiFormFieldComponent,
  PuiInputDirective,
  PuiLabelDirective
} from '@nexplore/practices-ui-tailwind';

@Component({
  selector: 'app-example-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PracticesTailwindFormComponentsModule,
    PuiFormDirective,
    PuiButtonDirective
  ],
  template: `
    <form [formGroup]="exampleForm" puiForm [enableDirtyFormNavigationGuard]="true">
      <pui-form-field class="w-1/2">
        <label puiLabel>Text Input</label>
        <input puiInput type="text" [formControl]="exampleForm.controls.textInput"/>
        <p puiNotice>Additional information about this field</p>
      </pui-form-field>

      <pui-form-field class="w-1/2">
        <label puiLabel>Required Input</label>
        <input puiInput type="text" [formControl]="exampleForm.controls.requiredInput"/>
      </pui-form-field>

      <div class="flex gap-2 mt-4">
        <button
          puiButton
          type="submit"
          variant="primary"
          [clickCommand]="saveCommand">
          Submit
        </button>
        <button puiButton type="button">Cancel</button>
      </div>
    </form>
  `
})
export class ExampleFormComponent {
  private readonly _httpClient = inject(HttpClient);

  // Use the formGroup builder from @nexplore/practices-ng-forms for improved type safety
  exampleForm = formGroup.withBuilder(({ control }) => ({
    textInput: control<string | null>(null),
    requiredInput: control<string | null>(null)
  })).withValidation(({dependent}) => ({
    textInput: [], // No validation
    requiredInput: [
      dependent(({textInput}) =>
        // Example of a dependent validator that requires textInput to be filled
        // when requiredInput has a specific value
        value.requiredInput === 'special' && Validators.required
      })
    ]
  }));

  // Create a form submit command that validates before sending
  protected readonly saveCommand = command.actionSaveForm(
    // Reference to the form
    () => this.exampleForm,
    // Function to execute with form values after validation
    async (formValues) => {
      return await firstValueFrom(this._httpClient.post('/api/submit-data', formValues));
    }
  );
}
```

The form components include:

1. **Unsaved-Changes warning** with the `puiForm` directive
    - Keeps track of form state and validation
    - Enables dirty form navigation protection with `enableDirtyFormNavigationGuard` property

2. **Form Fields** with `pui-form-field` component
    - Provides consistent field layout and error handling
    - Supports labels, notices, and validation messaging

3. **Input Types**
    - Text inputs: `<input puiInput type="text">`
    - Number inputs: `<input puiInput type="number">`
    - Date inputs: `<input puiInput type="date">`
    - File inputs: `<input puiInput type="file">`
    - Select/dropdown: `<ng-select puiInput>` (requires [@ng-select/ng-select](https://github.com/ng-select/ng-select))

4. **Checkboxes and Radio Buttons**
    - Individual checkboxes: `<pui-checkbox>`
    - Checkbox groups: `<pui-checkbox-group>`
    - Radio button groups: `<pui-radio-button-group>`

5. **Buttons**
    - Submit buttons: `<button puiButton type="submit">`
    - Action buttons: `<button puiButton (click)="someAction()">`
    - Button variants: `variant="primary"`, `variant="secondary"`, `variant="danger"`, `variant="danger-primary"`
    - Button sizes: Standard and `large-round` for round buttons

All form components work with both template-driven and reactive forms approaches.

### Data Display Components

#### Tables with Infinite Scrolling

The library supports advanced table features including infinite scrolling pagination:

```typescript
import { Component } from '@angular/core';
import {
    PuiTableComponent,
    PuiTableColumnComponent,
    PuiTableRowComponent,
    PuiTableCellComponent,
    PuiTablePaginationInfiniteScrollComponent,
    PuiTableHoverEmphasisDirective,
    TableViewSource,
} from '@nexplore/practices-ui-tailwind';

@Component({
    selector: 'app-table-example',
    standalone: true,
    imports: [
        PuiTableComponent,
        PuiTableColumnComponent,
        PuiTableRowComponent,
        PuiTableCellComponent,
        PuiTablePaginationInfiniteScrollComponent,
        PuiTableHoverEmphasisDirective,
    ],
    template: `
        <pui-table [tableViewSource]="tableSource" noItemsMessage="No items available">
            <pui-table-column field="id" caption="ID"></pui-table-column>
            <pui-table-column field="name" caption="Name"></pui-table-column>
            <pui-table-column field="created" caption="Created"></pui-table-column>

            @for (item of tableSource.pageDataSignal(); track item.id) {
                <pui-table-row>
                    <pui-table-cell>{{ item.id }}</pui-table-cell>
                    <pui-table-cell>{{ item.name }}</pui-table-cell>
                    <pui-table-cell>{{ item.created | date }}</pui-table-cell>
                </pui-table-row>
            }
            <pui-table-footer>
                <pui-table-pagination-infinite-scroll />
            </pui-table-footer>
        </pui-table>
    `,
})
export class TableWithInfiniteScrollingComponent {
    tableSource = new TableViewSource(
        { columns: ['id', 'name', 'created'] },
        (params) => this.loadData(params),
        { take: 30 }, // Items per batch
    );

    private loadData(params) {
        // Implementation of data loading
    }
}
```

For more examples, see the [Table Component stories](./src/lib/table/table.stories.ts).

#### Expansion Panels

Expandable panels with auto-scroll capability:

```html
<pui-expansion-panel
    heading="Details"
    [isExpanded]="true"
    [disableScrollIntoView]="true"
    [enableContentScroll]="true"
    variant="default"
>
    <!-- Panel content here -->
    <p>Expansion panel content that can be toggled.</p>
</pui-expansion-panel>
```

### Display Components

#### Timeline Component

##### Overview

The `PuiTimelineComponent` is a standalone Angular component designed to create a vertical timeline layout. It organizes timeline items in a flexible column layout with customizable alignment options.

##### Features

- Flexible vertical layout with consistent spacing between items
- Configurable alignment for timeline items (`left` or `right`)
- Integrates seamlessly with `PuiTimelineItemComponent` for individual timeline entries
- Uses Tailwind CSS utility classes for styling
- Supports Angular standalone component architecture and OnPush change detection for performance

##### Usage

Import the component and use it to wrap `pui-timeline-item` components or any content you want to display in the timeline.

```html
<pui-timeline alignment="right">
    <pui-timeline-item>
        <p>Your timeline content here</p>
    </pui-timeline-item>
    <pui-timeline-item>
        <p>Another event</p>
    </pui-timeline-item>
</pui-timeline>
```

##### Related Components

- `PuiTimelineItemComponent`: Individual timeline item component that respects the alignment set by `PuiTimelineComponent` or can override it individually.

---

### Status Hub Component

The Status Hub component provides centralized management of application status feedback including loading indicators, error notifications, and success messages. It aggregates multiple concurrent operations and presents their status in a consistent user interface.

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PuiStatusHubComponent, PuiErrorStatusDirective } from '@nexplore/practices-ui-tailwind';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, PuiStatusHubComponent, PuiErrorStatusDirective],
    template: `
        <router-outlet></router-outlet>

        <!-- Add the Status Hub at the root level of your application -->
        <pui-status-hub position="bottom-right">
            <!-- Optional custom error template -->
            <ng-template puiIfErrorStatus let-status>
                <div class="custom-error">
                    An error occurred: {{ status.error?.message }}
                    <!-- You can add custom actions here -->
                </div>
            </ng-template>
        </pui-status-hub>
    `,
})
export class AppComponent {}
```

#### Key Features

1. **Busy State Management**: Displays loading indicators for operations in progress
    - Delayed spinner appearance to prevent flickering for quick operations
    - Full-screen blocking overlay for critical operations

2. **Toast Notifications**: Shows error and success messages in toast format
    - Automatic dismissal of success messages
    - Persistent error messages requiring user acknowledgment
    - Support for multiple concurrent notifications

3. **Status Categorization**: Applies appropriate visual treatment based on operation type
    - `action`: Generic operations
    - `action-save`: Save operations with appropriate messaging
    - `action-delete`: Delete operations with appropriate messaging
    - `query`: Data retrieval operations
    - `query-list`: List data loading operations

4. **Positioning Control**: Configurable notification position
    - `top-left`, `top`, `top-right`
    - `bottom-left`, `bottom`, `bottom-right`

5. **Integration with Command Pattern**: Works seamlessly with `@nexplore/practices-ng-commands`
    - Automatic status tracking for commands
    - Standardized success and error handling

#### Configuration Options

The Status Hub can be configured with various options:

```html
<pui-status-hub
    [statusHubConfig]="{
      maxVisibleEventCount: 3,            
      messageEventTimeToLiveMs: 5000,     
      busyAsSilentByDefault: false,       
      disableLogErrorsToConsole: false    
    }"
    [alertThrottleTimeMs]="100"
    [spinnerThrottleTimeMs]="2000"
    position="bottom-left"
>
</pui-status-hub>
```

#### Customizing Error Display

You can provide a custom template for error messages using the `puiIfErrorStatus` directive:

```html
<pui-status-hub>
    <ng-container *puiIfErrorStatus="let status">
        Etwas ist schief gelaufen!
        <pui-expansion-panel
            *ngIf="status.error?.stack ?? status.error?.message"
            caption="Details"
            class="flex-grow-0 text-black"
            [enableContentScroll]="true"
        >
            <code *ngIf="status.error.stack" class="whitespace-pre">
                {{ status?.error.stack ?? status.error?.message }}
            </code>
        </pui-expansion-panel>
    </ng-container>
</pui-status-hub>
```

#### Working with the Status Hub Service

The Status Hub integrates seamlessly with commands, queries, and list view sources from the Practices libraries. You should not use the StatusHubService's register method directly - instead, use the higher-level abstractions:

```typescript
import { Component, inject, input } from '@angular/core';
import { command } from '@nexplore/practices-ng-commands';
import { HttpClient } from '@angular/common/http';
import { tableViewSource } from '@nexplore/practices-ng-list-view-source';
import { formGroup } from '@nexplore/practices-ng-forms';

@Component({
    // ...
})
export class MyComponent {
    private readonly _httpClient = inject(HttpClient);

    // Command patterns that work automatically with Status Hub:

    // 1. Action command - already configured with appropriate status defaults
    protected readonly saveCommand = command.action(() =>
        this._httpClient.post('/api/data', {
            /* your data */
        }),
    );

    // 2. Signal-triggered query - for data that depends on an input
    public readonly idSignal = input.required<string>({ alias: 'id' });
    protected readonly itemQuery = command.query.withSignalTrigger(this.idSignal, (id) =>
        this._httpClient.get(`/api/items/${id}`),
    );

    // 3. Delete command - automatically uses action-delete status category
    protected readonly deleteCommand = command.actionDelete((id: string) =>
        this._httpClient.delete(`/api/items/${id}`),
    );

    // 4. Form submission - validation and status handling built-in
    protected readonly userForm = formGroup.withBuilder(({ control }) => ({
        name: control<string>(''),
        email: control<string>(''),
    }));
    protected readonly submitFormCommand = command.actionSaveForm(
        () => this.userForm,
        (formValue) => this._httpClient.post('/api/users', formValue),
    );

    // 5. Data tables - status handling already configured
    protected readonly filterForm = formGroup.withBuilder(({ control }) => ({
        searchTerm: control<string | null>(null),
    }));
    protected readonly usersTableSource = tableViewSource.withFilterForm({
        filterForm: this.filterForm,
        loadFn: (params) => this._httpClient.get('/api/users', { params }),
        columns: {
            name: { columnLabelKey: 'user.name', sortable: true },
            email: { columnLabelKey: 'user.email', sortable: true },
        },
    });

    // You can customize status options when needed (but defaults are usually sufficient)
    protected readonly customizedCommand = command.action(
        () =>
            this._httpClient.post('/api/important-data', {
                /* data */
            }),
        {
            status: {
                progressMessage: 'Processing critical data...',
                blocking: true, // Show a blocking overlay during execution
            },
        },
    );

    // Usage in templates:
    // <button puiButton [clickCommand]="saveCommand">Save</button>
    // <ng-container *puiAwaitQuery="itemQuery; let item">{{ item.name }}</ng-container>
    // <pui-table [tableViewSource]="usersTableSource">...</pui-table>
}
```

This approach ensures that status information is properly tracked and displayed in the Status Hub automatically.

### Dialogs and Popups

The library provides flexible dialog components for user interactions:

#### Modal Dialogs

Simple modal dialog example:

```typescript
// Open a modal dialog
const dialogRef = this._modalService.open(YourModalComponent, {
    data: { parameter: 'value' },
});

// Handle the result when closed
dialogRef.closed.subscribe((result) => {
    if (result) {
        // Handle result
    }
});
```

```html
<!-- Modal content component template -->
<pui-modal>
    <pui-modal-title>Modal Title</pui-modal-title>
    <pui-modal-subtitle>Modal Subtitle</pui-modal-subtitle>
    <div puiModalContent>Modal content here</div>
    <button puiModalFooterAction puiButton>Close</button>
</pui-modal>
```

For more examples, see the [Popup stories](./src/lib/popup/popups.stories.ts) and [sample implementation](../samples-tailwind/src/app/practices-ui-tailwind-samples/popups/modal.component.ts).

#### Action Dialogs

Pre-configured dialogs for common actions like confirmations:

```typescript
import { Component, inject } from '@angular/core';
import { PuiActionDialogService, PUIBE_DIALOG_PRESETS } from '@nexplore/practices-ui-tailwind';

@Component({
    // ...
})
export class ExampleComponent {
    private readonly _actionDialog = inject(PuiActionDialogService);

    // Using showAsync with predefined presets
    async confirmDeletion() {
        const result = await this._actionDialog.showAsync(PUIBE_DIALOG_PRESETS.confirmDelete(() => this.deleteItem()));
    }

    // Using createShowCommand for template binding
    protected readonly deleteCommand = this._actionDialog.createShowCommand(
        PUIBE_DIALOG_PRESETS.confirmDelete((item) => this.deleteItem(item.id)),
    );

    private deleteItem(id?: string) {
        // Implementation
        return Promise.resolve(true);
    }
}
```

For more examples, see the [Action Dialog stories](./src/lib/popup/action-dialog.stories.ts).

### Side Overlay Panel

The **Side Overlay Panel** is a reusable, service-driven slide-in panel component. It enables contextual overlays (e.g., detail views, forms, or history) without navigating away from the main UI. Built using Angular CDK overlays and standalone APIs.

#### Basic Usage

Using Angular's `inject()` function:

```ts
import { inject } from '@angular/core';
import { PuiSideOverlayPanelService } from './side-overlay-panel.service';
import { SettingsComponent } from './settings.component';

const sideOverlay = inject(PuiSideOverlayPanelService);

sideOverlay.open({
    titleKey: 'settings.title',
    content: SettingsComponent,
});
```

### Additional Features

#### Side Navigation

A collapsible side menu with multi-level navigation:

```html
<pui-side-navigation [open]="true">
    <!-- Primary navigation pane -->
    <pui-side-navigation-pane>
        <!-- Basic navigation item -->
        <pui-side-navigation-item [showAsHomeIcon]="true" routerLink="/home"> Home </pui-side-navigation-item>

        <!-- Expandable item with children -->
        <pui-side-navigation-item [canExpand]="true" [expanded]="isExpanded" (click)="isExpanded = true">
            Users
        </pui-side-navigation-item>
    </pui-side-navigation-pane>

    <!-- Secondary navigation pane shown when Users is expanded -->
    <pui-side-navigation-pane [canClose]="true" [open]="isExpanded" heading="Users">
        <pui-side-navigation-item routerLink="/users/list">All Users</pui-side-navigation-item>
        <pui-side-navigation-item routerLink="/users/add">Add User</pui-side-navigation-item>
    </pui-side-navigation-pane>
</pui-side-navigation>
```

For auto-generating from routes:

```html
<pui-side-navigation [useRouterConfig]="routes" [open]="true"></pui-side-navigation>
```

For more examples, see the [Side Navigation stories](./src/lib/side-navigation/side-navigation.stories.ts).

#### Drop-down Button

Button with drop-down menu:

```html
<pui-dropdown-button
    label="Options"
    [options]="[

    { labelContent: 'Option 1', routerLink: '/path1' },
    { labelContent: 'Option 2', onClickHandler: () => handleClick() }
  ]"
>
</pui-dropdown-button>
```

#### Flyout Components

Flyouts are context-sensitive panels that appear next to an element:

```typescript
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { PuiFlyoutService } from '@nexplore/practices-ui-tailwind';

@Component({...})
export class ExampleComponent {
  private readonly _flyoutService = inject(PuiFlyoutService);

  @ViewChild('flyoutButton', { read: ElementRef, static: true })
  flyoutButtonRef: ElementRef<HTMLElement>;

  openFlyout(): void {
    this._flyoutService.open(
      FlyoutContentComponent,
      {
        data: { parameter: 'value' },
        showArrowTips: true, // Arrow pointing to button
        preferredPosition: {
          originX: 'start', originY: 'bottom',
          overlayX: 'start', overlayY: 'top'
        }
      },
      this.flyoutButtonRef.nativeElement
    );
  }
}
```

```html
<!-- Flyout content component template -->
<pui-flyout>
    <div puiFlyoutTitle>Flyout Title</div>
    <div puiFlyoutContent>Content here</div>
    <button puiButton puiFlyoutFooterAction>Close</button>
</pui-flyout>
```

For more examples, see the [Popup stories](./src/lib/popup/popups.stories.ts).

#### Sticky Elements

Create elements that stick to the viewport during scrolling:

```html
<!-- Basic usage: stick to top of viewport -->
<div puiSticky [puiStickyThresholdPx]="0">This content will stick to the top of the viewport</div>
```

Key features:

- Stick to any edge: `puiStickyDir="top|bottom|left|right"`
- Custom offset: `[puiStickyThresholdPx]="64"` (in pixels)
- Apply classes conditionally: `puiStickyClass="my-sticky-class"`

- Stick to any edge: `puiStickyDir="top|bottom|left|right"`
- Custom offset: `[puiStickyThresholdPx]="64"` (in pixels)
- Apply classes conditionally: `puiStickyClass="my-sticky-class"`

For more examples, see the [Sticky directive source](./src/lib/util/sticky.directive.ts).

#### In-page Search

Simple search functionality within the current page:

```html
<pui-inpage-search placeholder="Search on this page..." label="Page search"> </pui-inpage-search>
```

You can customize with additional options:

```html
<!-- With pending state -->
<pui-inpage-search [pending]="isSearching"> </pui-inpage-search>

<!-- Two-way binding with ngModel -->
<pui-inpage-search [(ngModel)]="searchTerm" (searchTermChange)="onSearch($event)"> </pui-inpage-search>
```

For more examples, see the [In-page Search stories](./src/lib/inpage-search/inpage-search.stories.ts).

#### Modules for Easy Import

The library provides convenient modules for importing related components:

- `PracticesTailwindShellModule` - Shell components for application layout
- `PracticesTailwindFormComponentsModule` - All form-related components
- `PracticesTailwindTableComponentsModule` - Table and data display components
- `PracticesTailwindDialogModule` - Modal and dialog components
- `PracticesTailwindFlyoutModule` - Flyout sidebar components

All components are also available as standalone components, allowing for fine-grained imports when using Angular's standalone component pattern.

