# @nexplore/practices-ui (Legacy)

This library provides agnostic services and helpers for Angular applications. It exposes core services that are used by the actual practices-ui libraries and re-exports some symbols from the other `practices-ng-*` libraries.

> **Legacy Note:** This library is considered legacy, as most features have been split into separate packages. It is not deprecated, as there are still features that are not available in the new packages. It could potentially be deprecated in the future.

## Purpose

This library serves as a foundational layer for Angular applications, providing core services for common needs like page titles, translation parsing, and component lifecycle management.

## Installation

```bash
pnpm install @nexplore/practices-ui
```

## Features and Usage Examples

### Title Management - [`TitleService`](./src/lib/title/title.service.ts)

A service implementing Angular's `TitleStrategy` for managing the page title with breadcrumb support:

```typescript
import { TitleService } from '@nexplore/practices-ui';
import { Component, inject } from '@angular/core';

@Component({...})
export class AppComponent {
  private readonly _titleService = inject(TitleService);

  ngOnInit() {
    // Set the application title
    this._titleService.setTitle('My Application');

    // Set page title with breadcrumb
    this._titleService.setBreadcrumbs([
      { label: 'Home', route: '/' },
      { label: 'Users', route: '/users' },
      { label: 'User Details' }
    ]);
  }
}
```

### Translation Support - [`RewriteTranslateParser`](./src/lib/translate/rewrite-translate-parser.ts)

A custom `TranslateParser` which rewrites resource types for translations to work well with .NET resource file format:

```typescript
import { provideTranslateParser } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';

// In your app providers
const providers = [provideTranslateParser()];

// This allows using .NET resource format in translations
// For example: "Common.Buttons_Save" instead of requiring "Common.Buttons.Save"
```

### Component Lifecycle - [`DestroyService`](./src/lib/destroy/destroy.service.ts)

A service for handling the `ngOnDestroy` lifecycle hook (deprecated in favor of Angular's `DestroyRef`):

```typescript
import { DestroyService } from '@nexplore/practices-ui';
import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    // ...
    providers: [DestroyService], // Provide at component level
})
export class MyComponent {
    private readonly _destroy$ = inject(DestroyService);

    ngOnInit() {
        someObservable$.pipe(takeUntil(this._destroy$)).subscribe(() => {
            // Will be automatically unsubscribed when component is destroyed
        });
    }

    // No need to implement ngOnDestroy
}
```

> **Note:** This service is deprecated. Use Angular's `DestroyRef` instead:
>
> ```typescript
> import { Component, DestroyRef, inject } from '@angular/core';
> import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
>
> @Component({...})
> export class MyComponent {
>   private readonly _destroyRef = inject(DestroyRef);
>
>   ngOnInit() {
>     someObservable$
>       .pipe(takeUntilDestroyed(this._destroyRef))
>       .subscribe(() => {
>         // Will be automatically unsubscribed
>       });
>   }
> }
> ```

### Global Configuration - [`providePractices`](./src/lib/providers/practices.providers.ts)

Use the `providePractices` function to provide and configure all services in one step:

```typescript
import { providePractices } from '@nexplore/practices-ui';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
    providers: [
        providePractices({
            titleSeparator: ' | ',
            applicationTitle: 'My Application',
        }),
    ],
});
```

### Command System - [`Command` (now LegacyCommand)](./src/lib/command/command.ts)

> **Deprecated:** The Command system has been replaced by a more powerful fluent builder API in [@nexplore/practices-ng-commands](../practices-ng-commands/README.md). The original Command is renamed to LegacyCommand but still exported as Command for backwards compatibility.

```typescript
// Legacy approach
import { Command } from '@nexplore/practices-ui';

const saveCommand = Command.create(() => saveUser(), {
    progressMessage: 'Saving user...',
    successMessage: 'User saved successfully',
    blocking: true,
});

// Modern approach
import { command } from '@nexplore/practices-ng-commands';

const saveCommand = command.action(() => saveUser(), {
    status: {
        progressMessage: 'Saving user...',
        successMessage: 'User saved successfully',
        blocking: true,
    },
});
```

### ListViewSource and StatusHubService

These features are now re-exported from dedicated packages and might be removed from this package in the future:

- **ListViewSource**: Re-exported from [@nexplore/practices-ng-list-view-source](../practices-ng-list-view-source/README.md)
- **StatusHubService**: Re-exported from [@nexplore/practices-ng-status](../practices-ng-status/README.md)

For new code, it's recommended to import these directly from their respective packages.

## Integration with Other Libraries

This library complements the modern `practices-ng-*` packages and is used alongside:

- **[@nexplore/practices-ui-ktbe](../practices-ui-ktbe/README.md)** - KTBE-styled UI component library
- **[@nexplore/practices-ui-clarity](../practices-ui-clarity/README.md)** - Extensions for Clarity Design System

## Running unit tests

Run `nx test practices-ui` to execute the unit tests.

