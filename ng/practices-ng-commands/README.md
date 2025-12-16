# @nexplore/practices-ng-commands

This library provides a powerful command pattern implementation for Angular applications, making it easier to handle asynchronous operations, manage their state, and integrate with UI components.

## Purpose

Commands encapsulate common logic and state handling, typically required to render buttons with loading states, error messages, and success messages - saving you from reimplementing the same patterns across your Angular application. They provide a structured way to represent user actions and data operations with built-in state management.

## Features

-   **State Management** - Track busy, success, and error states for asynchronous operations
-   **Form Integration** - Validate forms before command execution
-   **UI Directives** - Built-in directives for binding commands to buttons and UI elements
-   **Status Notifications** - Automatic integration with StatusHubService for user feedback
-   **Query Management** - Specialized commands for data fetching with automatic triggering
-   **Signal Integration** - Full support for Angular signals for reactive state tracking
-   **Type Safety** - Comprehensive TypeScript type safety across all APIs

## Installation

```bash
npm install @nexplore/practices-ng-commands
```

## Features and Usage Examples

### Action Commands - [`command.action`](./src/lib/command-fluent-builder/create-action-command.ts)

Action commands execute asynchronous operations with built-in state tracking:

```typescript
import { command } from '@nexplore/practices-ng-commands';
import { Component, inject } from '@angular/core';

@Component({...})
export class MyComponent {
  private readonly _userService = inject(UserService);

  // Basic action command
  protected readonly saveCommand = command.action(
    async () => {
      await this._userService.saveCurrentUser();
      return 'Success!';
    },
    {
      status: {
        successMessage: 'User saved successfully!',
        errorMessage: 'Failed to save user',
        progressMessage: 'Saving user...'
      }
    }
  );

  // Command with arguments (useful in loops)
  someItems = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ];

  protected readonly deleteItemCommand = command.actionDelete(
    async (args: { id: string, name: string }) => {
      await this._userService.deleteItem(args.id);
    }
  );
}
```

In the template, trigger the command with a button using the [`puiClickCommand`](./src/lib/directives/click-command.directive.ts) directive:

```html
<!-- Basic command button -->
<button [puiClickCommand]="saveCommand">Save</button>

<!-- Command with arguments in a loop -->
@for (item of someItems; track item.id) {
<li>
    <span>{{item.name}}</span>
    <button [puiClickCommand]="deleteItemCommand" [commandArgs]="item">Delete</button>
</li>
}
```

### Form Integration - [`command.actionSaveForm`](./src/lib/command-fluent-builder/create-save-form-command.ts)

Commands can validate forms before execution, ensuring only valid forms are submitted:

```typescript
import { command } from '@nexplore/practices-ng-commands';
import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({...})
export class UserFormComponent {
  private readonly _userService = inject(UserService);

  protected readonly formGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  // Form submission command that validates the form before executing
  protected readonly saveCommand = command.actionSaveForm(
    () => this.formGroup,
    async (formValue) => {
      await this._userService.saveUser(formValue);
    },
    {
      status: {
        successMessage: 'User saved successfully!'
      }
    }
  );
}
```

In the template:

```html
<form [formGroup]="formGroup">
    <input formControlName="name" placeholder="Name" />
    <input formControlName="email" placeholder="Email" />

    <button [puiClickCommand]="saveCommand">Save</button>
</form>
```

### Query Commands - [`command.query`](./src/lib/command-fluent-builder/query)

Query commands are designed for data fetching with various triggering mechanisms:

#### Signal-triggered Queries - [`command.query.withSignalTrigger`](./src/lib/command-fluent-builder/query/create-query-command-with-signal-trigger.ts)

Fetch data automatically when a signal changes, ideal for component inputs:

```typescript
import { command } from '@nexplore/practices-ng-commands';
import { Component, inject, input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({...})
export class UserDetailComponent {
  private readonly _httpClient = inject(HttpClient);

  // Input that will trigger the query
  public readonly userIdSignal = input.required<string>({ alias: 'userId' });

  // Query that runs whenever userId changes
  protected readonly userQuery = command.query.withSignalTrigger(
    this.userIdSignal,
    (id) => this._httpClient.get<User>(`/api/users/${id}`)
  );

  // Access the result as a signal
  protected readonly userSignal = this.userQuery.resultSignal;
}
```

In the template:

```html
<div *ngIf="userQuery.busySignal()">Loading user...</div>

@if (userSignal(); as user) {
<div class="user-details">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
</div>
}
```

#### Auto-triggered Queries - [`command.query.withAutoTrigger`](./src/lib/command-fluent-builder/query/create-query-command-with-auto-trigger.ts)

Queries that automatically execute once during initialization:

```typescript
import { command } from '@nexplore/practices-ng-commands';
import { Component, inject } from '@angular/core';

@Component({...})
export class ProductListComponent {
  private readonly _productService = inject(ProductService);

  // Automatically loads on component initialization
  protected readonly productsQuery = command.query.withAutoTrigger(
    () => this._productService.getProducts()
  );

  // Access the result
  protected readonly productsSignal = this.productsQuery.resultSignal;
}
```

#### Command Dependencies - [`command.query.withCommandSourceDependency`](./src/lib/command-fluent-builder/query/create-query-command-with-command-source-dependency.ts)

Create queries that depend on another command's result:

```typescript
import { command } from '@nexplore/practices-ng-commands';
import { Component, inject } from '@angular/core';

@Component({...})
export class OrderDetailComponent {
  private readonly _orderService = inject(OrderService);

  // First query to load an order
  protected readonly orderQuery = command.query.withSignalTrigger(
    this.orderIdSignal,
    (id) => this._orderService.getOrder(id)
  );

  // Second query depends on the first query's result
  protected readonly orderItemsQuery = command.query.withCommandSourceDependency(
    this.orderQuery,
    (order) => this._orderService.getOrderItems(order.id)
  );
}
```

### Working with Command Results - [`*puiAwaitQuery`](./src/lib/directives/await-query.directive.ts)

The `*puiAwaitQuery` directive provides a convenient way to handle different query states in templates:

```html
<ng-container
    *puiAwaitQuery="userQuery; 
                          as: user;
                          loadingFirstTime: initialLoadingTmpl; 
                          loading: loadingTmpl; 
                          empty: emptyTmpl; 
                          error: errorTmpl"
>
    <div class="user-container">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
    </div>
</ng-container>

<ng-template #initialLoadingTmpl>
    <div class="loading-skeleton">Loading user data...</div>
</ng-template>

<ng-template #loadingTmpl>
    <div class="loading-overlay">Refreshing...</div>
</ng-template>

<ng-template #emptyTmpl>
    <div class="empty-state">No user found</div>
</ng-template>

<ng-template #errorTmpl let-error>
    <div class="error-state">Error loading user: {{ error }}</div>
</ng-template>
```

### Background Commands - [`command.background`](./src/lib/command-fluent-builder/create-background-command.ts)

For long-running background operations that are basically like auto triggering commands, but don't show any UI:

```typescript
import { command } from '@nexplore/practices-ng-commands';
import { Component, inject } from '@angular/core';

@Component({...})
export class DataSyncComponent {
  private readonly _syncService = inject(SyncService);

  protected readonly syncCommand = command.background(
    async () => {
      // This won't block the UI with a loading indicator
      await this._syncService.syncData();
    }
  );
}
```

### Status Integration - [`StatusHubService`](../practices-ng-status/src/lib/status/status-hub.service.ts)

Commands automatically integrate with the `StatusHubService` for user notifications, and can be configured accordingly:

```typescript
import { command } from '@nexplore/practices-ng-commands';

const saveCommand = command.action(
    async () => {
        await saveData();
    },
    {
        status: {
            successMessage: 'Data saved successfully!',
            errorMessage: 'Failed to save data',
            progressMessage: 'Saving data...',
            blocking: true, // Block UI with loading overlay
            autohide: false, // Used to override the default behaviour of non auto-hiding errors and auto-hiding success messages
            silent: false, // If `true`, the progress will not be shown (eg. no busy spinner), unless an error occurs.
            statusCategory: 'action-save', // Categorize for styling and default messages
        },
    }
);
```

Note, that each command factory function automaticallly applies the right defaults based on the purpose, for example `command.actionDelete` implicitly sets the statusCategory `action-delete`, while the `command.background` sets `silent: true`.
Thus, normally you wouldn't need to configure the status options yourself.

## Integration with Other Libraries

### practices-ng-status

The library automatically integrates with [`@nexplore/practices-ng-status`](../practices-ng-status/README.md) for reporting command execution states to the user.

### practices-ng-forms

Works well with [`@nexplore/practices-ng-forms`](../practices-ng-forms/README.md) for form validation and submission:

```typescript
import { command } from '@nexplore/practices-ng-commands';
import { formGroup } from '@nexplore/practices-ng-forms';

// Create a form with validation
const userForm = formGroup
    .withBuilder(({ control }) => ({
        name: control<string>(''),
        email: control<string>(''),
    }))
    .withValidation({
        name: [Validators.required],
        email: [Validators.required, Validators.email],
    });

// Create a save command that validates the form
const saveCommand = command.actionSaveForm(
    () => userForm,
    () => saveUser(this.userForm.value)
);
```

### practices-ui-ktbe

If using [`@nexplore/practices-ui-ktbe`](../practices-ui-ktbe/README.md), you can directly use the `clickCommand` input on buttons:

```html
<button puibeButton [clickCommand]="saveCommand" variant="primary">Save</button>
```

#### Confirmation Dialogs

When using the [`PuibeActionDialogService`](../practices-ui-ktbe/src/lib/popup/action-dialog.service.ts) from practices-ui-ktbe, you can create commands that show confirmation dialogs:

```typescript
import { Component, inject } from '@angular/core';
import { PuibeActionDialogService, PUIBE_DIALOG_PRESETS } from '@nexplore/practices-ui-ktbe';

@Component({...})
export class ItemListComponent {
  private readonly _itemService = inject(ItemService);
  private readonly _actionDialogService = inject(PuibeActionDialogService);

  // Create a delete command with confirmation dialog
  protected readonly confirmDeleteItemCommand = this._actionDialogService.createShowCommand(
    PUIBE_DIALOG_PRESETS.confirmDelete((item) =>
      this._itemService.deleteItem(item.id)
    )
  );

  // Use with puibeButton directive and pass the item as arguments
  // <button puibeButton [clickCommand]="confirmDeleteItemCommand" [commandArgs]="item">Delete</button>
}
```

The service also supports custom dialog configurations with:

-   Custom button layouts and behaviors
-   Custom action templates
-   Custom content templates or components
-   Asynchronous actions with advanced return types

For more advanced examples, see:

-   [Action Dialog Storybook Examples](../practices-ui-ktbe/src/lib/popup/action-dialog.stories.ts)
-   [Popups Samples in the KTBE Sample App](../samples-ktbe/src/app/practices-ui-ktbe-samples/popups/popups.component.ts)

## Running unit tests

Run `nx test practices-ng-commands` to execute the unit tests.
