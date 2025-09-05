# @nexplore/practices-ng-list-view-source

This library provides a comprehensive foundation for building data-driven list and table components in Angular applications. It works as the underlying data management layer for components like data tables, dropdown lists, and other list-based UI elements.

## Purpose

List views are a common UI pattern in applications, and this library offers a standardized approach for managing the data behind these views. It handles the complexities of data loading, filtering, sorting, and pagination, allowing developers to focus on creating the UI components that display the data.

## Features

-   **Fluent API** - Builder pattern for intuitive, chainable configuration
-   **Data Loading** - Standardized approach for loading data with server-side pagination and filtering
-   **Sorting & Filtering** - Built-in support for column sorting and configurable filtering
-   **Signal-based State** - Reactive state management using Angular signals
-   **Persistence Options** - Api to enable custom persistence strategies for sorting and filtering
-   **TypeScript Integration** - Fully typed APIs for improved developer experience
-   **Status Integration** - Automatic handling of loading states, errors, and success messages

## Installation

```bash
npm install @nexplore/practices-ng-list-view-source
```

## Features and Usage Examples

### Fluent API Builders - [`tableViewSource`](./src/lib/table-view-source/table-view-source.factory.ts) & [`selectViewSource`](./src/lib/select-view-source/select-view-source.factory.ts)

The library provides two main view source builders with a fluent API for chainable configuration:

```typescript
import { tableViewSource } from '@nexplore/practices-ng-list-view-source';

// Create and configure a table view source
const myTableSource = tableViewSource
  .withType<TItem>()
  .withConfig({...})
  .withFilterForm({...})
  .withPersistedParams({...});

// Alternative factory functions if you prefer
import {
  createTableViewSource,
  createTableViewSourceFromCommand,
  createTableViewSourceWithFilterForm
} from '@nexplore/practices-ng-list-view-source';

const myOtherTableSource = createTableViewSource({...});
```

### Data Loading with Angular Reactive Forms

The library seamlessly integrates with Angular Reactive Forms for filter controls:

```typescript
import { tableViewSource } from '@nexplore/practices-ng-list-view-source';
import { formGroup } from '@nexplore/practices-ng-forms';
import { Component, inject } from '@angular/core';

@Component({...})
export class UserListComponent {
  private readonly _userService = inject(UserService);

  protected readonly filterForm = formGroup.withBuilder(({control}) => ({
    searchTerm: control<string | null>(null),
    status: control<string | null>(null)
  }));

  protected readonly userTableSource = tableViewSource
    .withType<User>() // Specify the type for the items, makes the builder type-safe
    .withFilterForm({
      filterForm: this.filterForm, // Whenever the form changes, the table will be reloaded with the new filter values
      loadFn: (params) => this._userService.getUsers(
        params.filter.searchTerm,
        params.filter.status,
        params.skip,
        params.take,
        params.orderings,
        params.includeTotal
      ),
      columns: {
        name: {
          columnLabelKey: 'Labels.UserName', // Key may be used for i18n
          sortable: true
        },
        email: {
          columnLabelKey: 'Labels.UserEmail',
          sortable: true
        },
        status: {
          columnLabelKey: 'Labels.UserStatus',
          sortable: true
        }
      },
      orderBy: 'name' // Initial sort order
    });
}
```

### Persistence Options

The library provides architecture for state persistence but requires you to implement the actual persistence strategy (examples below). Note that these persistence functions are **not** provided by the library and need to be implemented in your application:

```typescript
// EXAMPLE: Create a persistence strategy for local storage
// You need to implement this function in your application
function persistParamsInLocalStorage(key: string) {
  return {
    save: (queryParams) => {
      localStorage.setItem(key, JSON.stringify(queryParams));
    },
    load: () => {
      const savedState = localStorage.getItem(key);
      if (savedState) {
        try {
          return JSON.parse(savedState);
        } catch (e) {
          console.error('Error parsing saved state from localStorage', e);
          return null;
        }
      }
      return null;
    },
  };
}

// Use your custom persistence strategy with the table source
tableViewSource
  .withFilterForm({...})
  .withPersistedParams(persistParamsInLocalStorage('user-list-state'));
```

### URL-based Persistence Strategy Example

Similarly, you can implement a URL-based persistence strategy in your application:

```typescript
import { inject } from '@angular/core';
import { Location as NgLocation } from '@angular/common';

// EXAMPLE: Create a persistence strategy for URL state
// You need to implement this function in your application
function persistParamsInCurrentNavigation() {
  const location = inject(NgLocation);

  return {
    save: (queryParams) => {
      location.replaceState(
        location.path(true),
        window.location.search,
        {
          ...(location.getState() as any),
          queryParams,
        }
      );
    },
    load: () => {
      const state = location.getState() as any;
      return state.queryParams;
    },
  };
}

// Use your custom persistence strategy with the table source
tableViewSource
  .withFilterForm({...})
  .withPersistedParams(persistParamsInCurrentNavigation());
```

### Complete UI Example with KTBE Components

```html
<form [formGroup]="filterForm" class="flex flex-wrap gap-4">
    <puibe-form-field>
        <label puibeLabel>Search</label>
        <input puibeInput [formControl]="filterForm.controls.searchTerm" />
    </puibe-form-field>

    <puibe-form-field>
        <label puibeLabel>Status</label>
        <ng-select puibeInput [formControl]="filterForm.controls.status">
            <ng-option [value]="null">All</ng-option>
            <ng-option value="active">Active</ng-option>
            <ng-option value="inactive">Inactive</ng-option>
        </ng-select>
    </puibe-form-field>
</form>

<puibe-table [tableViewSource]="userTableSource" class="w-full">
    <puibe-table-column [field]="userTableSource.columns.name" />
    <puibe-table-column [field]="userTableSource.columns.email" />
    <puibe-table-column [field]="userTableSource.columns.status" />

    @for (user of userTableSource.pageDataSignal(); track user.id) {
    <puibe-table-row>
        <puibe-table-cell>{{ user.name }}</puibe-table-cell>
        <puibe-table-cell>{{ user.email }}</puibe-table-cell>
        <puibe-table-cell>{{ user.status }}</puibe-table-cell>
    </puibe-table-row>
    }

    <puibe-table-footer>
        <puibe-table-pagination>
            <puibe-table-page-size>Items per page</puibe-table-page-size>
        </puibe-table-pagination>
    </puibe-table-footer>
</puibe-table>
```

### Infinite Scrolling Pagination

For scenarios where you prefer infinite scrolling instead of paginated navigation:

```html
<puibe-table [tableViewSource]="userTableSource" class="w-full">
    <!-- columns and rows as above -->

    <puibe-table-footer>
        <puibe-table-pagination-infinite-scroll [pageSize]="10" />
    </puibe-table-footer>
</puibe-table>
```

## Integration with Other Libraries

### .NET Backend Integration

When using with a .NET backend that implements the `Nexplore.Practices.Core` library:

```csharp
using Nexplore.Practices.Core;
using Nexplore.Practices.Core.Query;

public class SampleController(
    ISampleRepository sampleRepository,
    SampleMapper mapper)
{
    [HttpGet]
    [return: NotNull]
    public async Task<ListResult<SampleListEntryDto>> GetAllAsync([FromQuery] SampleListQueryParams queryParams)
    {
        return await sampleRepository.GetAllByFilters(
                queryParams.SearchTerm)
            .ToListResultAsync(queryParams, mapper.ToListDto);
    }
}
```

### practices-ng-commands

Works seamlessly with [`@nexplore/practices-ng-commands`](../practices-ng-commands/README.md) for query commands and action handling:

```typescript
import { command } from '@nexplore/practices-ng-commands';
import { tableViewSource } from '@nexplore/practices-ng-list-view-source';

const myIdSignal = signal(123);

// Create a query command
const usersQuery = command.query.withSignalTrigger(myIdSignal, (id) => this._userService.getUsers(id));

// Create a table view source from the command
const tableSource = tableViewSource.fromCommand(usersQuery, {
    columns: {
        name: { columnLabelKey: 'Labels.UserName', sortable: true },
        email: { columnLabelKey: 'Labels.UserEmail', sortable: true },
    },
});
```

## Running unit tests

Run `nx test practices-ng-list-view-source` to execute the unit tests.
