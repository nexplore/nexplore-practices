# @nexplore/practices-ng-status

This library provides a comprehensive system for managing application status states in Angular applications, including busy indicators, error messages, and success notifications.

## Purpose

The [`StatusHubService`](./src/lib/status/status-hub.service.ts) is a foundation for providing status progress tracking and notifications in Angular applications. It acts as a centralized hub for managing and aggregating status information from multiple concurrent operations.

> **Note:** Typically, you don't need to use the StatusHubService directly in applications. Higher-level libraries like [`@nexplore/practices-ng-commands`](../practices-ng-commands/README.md) and [`@nexplore/practices-ng-list-view-source`](../practices-ng-list-view-source/README.md) already integrate with this service through their fluent builder APIs.

## Features

- **Centralized Status Management** - Manage all application status states through a single service
- **Busy State Handling** - Track multiple concurrent operations with automatic aggregation
- **Error & Success Notifications** - Display and manage error and success messages with auto-dismissal
- **Blocking UI Support** - Optionally block user interaction during critical operations
- **Progress Messages** - Display dynamic progress messages during long-running operations
- **Status Categories** - Categorize operations for consistent visual representation
- **Configurable Behavior** - Customize timeout duration, visibility rules, and more

## Installation

```bash
pnpm install @nexplore/practices-ng-status
```

## Features and Usage Examples

### Centralized Status Management - [`StatusHubService`](./src/lib/status/status-hub.service.ts)

The StatusHubService is the central service for managing application status. It provides busy state tracking, error and success message management, and aggregation of multiple concurrent status events.

```typescript
import { Component, inject } from '@angular/core';
import { StatusHubService } from '@nexplore/practices-ng-status';

@Component({...})
export class MyStatusComponent {
  private readonly _statusHub = inject(StatusHubService);

  // Subscribe to busy state
  protected readonly busy$ = this._statusHub.busy$;

  // Subscribe to blocking busy state (prevents user interaction)
  protected readonly busyAndBlocking$ = this._statusHub.busyAndBlocking$;

  // Subscribe to aggregated status information
  protected readonly status$ = this._statusHub.status$;
}
```

### Direct Registration of Status Events

Although typically not needed (as higher-level libraries handle this), you can directly register operations with the StatusHubService:

```typescript
import { StatusHubService } from '@nexplore/practices-ng-status';
import { Component, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({...})
export class MyComponent {
  private readonly _statusHub = inject(StatusHubService);

  performOperation() {
    const operation$ = this.dataService.performOperation().pipe(
      map(result => ({ busy: false, success: 'Operation completed' })),
      catchError(error => of({ busy: false, error: error }))
    );

    // Register operation with the status hub
    this._statusHub.register(operation$, {
      progressMessage: 'Operation in progress...',
      blocking: true,
      statusCategory: 'action'
    });
  }
}
```

### Custom Status UI Components

If not using the provided UI components, you can create your own UI that displays the status information:

```typescript
import { Component, inject } from '@angular/core';
import { StatusHubService } from '@nexplore/practices-ng-status';

@Component({
    selector: 'app-status-hub',
    template: `
        <div class="loading-overlay" *ngIf="statusHub.busyAndBlocking$ | async">
            <div class="spinner"></div>
            <div class="message">{{ (statusHub.aggregatedStatus$ | async)?.progressMessage }}</div>
        </div>

        <div class="toast-container">
            <div class="toast error" *ngIf="(statusHub.aggregatedStatus$ | async)?.error">
                <div class="message">{{ (statusHub.aggregatedStatus$ | async)?.error }}</div>
                <button (click)="(statusHub.aggregatedStatus$ | async)?.dismissError()">✕</button>
            </div>

            <div class="toast success" *ngIf="(statusHub.aggregatedStatus$ | async)?.success">
                <div class="message">{{ (statusHub.aggregatedStatus$ | async)?.success }}</div>
                <button (click)="(statusHub.aggregatedStatus$ | async)?.dismissSuccess()">✕</button>
            </div>
        </div>
    `,
})
export class StatusHubComponent {
    protected readonly statusHub = inject(StatusHubService);
}
```

### Status Categories - [`StatusCategory`](./src/lib/status/types.ts)

Status categories help give context to operations, which can be used by UI components to display appropriate indicators:

```typescript
import { StatusHubService } from '@nexplore/practices-ng-status';

// Different status categories for different operations
statusHub.register(saveOperation$, { statusCategory: 'action-save' });
statusHub.register(deleteOperation$, { statusCategory: 'action-delete' });
statusHub.register(loadDataOperation$, { statusCategory: 'query' });
statusHub.register(loadListOperation$, { statusCategory: 'query-list' });

// Available categories:
// 'none' - No specific category
// 'action' - General action
// 'query' - Data retrieval operation
// 'query-list' - List data retrieval
// 'action-save' - Save operation
// 'action-delete' - Delete operation
```

### Custom Configuration - [`StatusHubConfig`](./src/lib/status/types.ts)

The StatusHubService provides configuration options to customize behavior:

```typescript
import { StatusHubService } from '@nexplore/practices-ng-status';
import { Component, inject } from '@angular/core';

@Component({...})
export class AppComponent {
  private readonly _statusHub = inject(StatusHubService);

  constructor() {
    // Configure the status hub
    this._statusHub.config = {
      maxVisibleEventCount: 3,            // Maximum number of visible status events
      messageEventTimeToLiveMs: 5000,     // How long success messages stay visible
      busyAsSilentByDefault: false,       // Whether busy operations show UI by default
      disableLogErrorsToConsole: false    // Whether to log errors to console
    };

    // Or retrieve latest events with custom config
    const statusEvents$ = this._statusHub.getLatestStatusEventsWithConfig$({
      maxVisibleEventCount: 5
    });
  }
}
```

## Integration with Other Libraries

### practices-ng-commands

The [`@nexplore/practices-ng-commands`](../practices-ng-commands/README.md) library automatically integrates with StatusHubService. When you create commands using its fluent API, they will automatically report their status to the StatusHubService:

```typescript
import { command } from '@nexplore/practices-ng-commands';

const saveCommand = command.action(() => saveData(), {
    status: {
        progressMessage: 'Saving data...',
        successMessage: 'Data saved successfully',
        errorMessage: (error) => `Error saving data: ${error.message}`,
        blocking: true,
        statusCategory: 'action-save', // Note all these configurations are optional, defaults are already configured
    },
});
```

### practices-ng-list-view-source

Similarly, [`@nexplore/practices-ng-list-view-source`](../practices-ng-list-view-source/README.md) integrates with StatusHubService for handling loading, filtering, and pagination states:

```typescript
import { tableViewSource } from '@nexplore/practices-ng-list-view-source';

const tableSource = tableViewSource.withConfig({
    // ...configuration
    statusOptions: {
        progressMessage: 'Loading data...', // Normally you don't need to set these status options, as there is defaults already configured
    },
});
```

## Running unit tests

Run `nx test practices-ng-status` to execute the unit tests.

