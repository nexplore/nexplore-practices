# @nexplore/practices-ui (Legacy)

This library provides agnostic services and helpers for Angular applications. It exposes core services that are used by the actual practices-ui libraries and re-exports some symbols from the other `practices-ng-*` libraries.

> **Legacy Note:** This library is considered legacy, as most features have been split into separate packages. It is not deprecated, as there are still features that are not available in the new packages. It could potentially be deprecated in the future.

## Purpose

This library serves as a foundational layer for Angular applications, providing core services for common needs like page titles, translation parsing, and component lifecycle management.

## Installation

```bash
npm install @nexplore/practices-ui
```

## Features and Usage Examples

### Title Management - [`TitleService`](./src/lib/services/title.service.ts)

A service implementing Angular's `TitleStrategy` for managing the page title (from the route `title`) and the title of the
breadcrumb leaf (`breadcrumbTitle$`). `providePractices()` registers it as `TitleStrategy`.

```typescript
import { TitleService } from '@nexplore/practices-ui';
import { Component, inject } from '@angular/core';

@Component({...})
export class UserDetailComponent {
  private readonly _titleService = inject(TitleService);

  ngOnInit() {
    // Set a custom page title (localized by default, also sets the breadcrumb title)
    this._titleService.setTitle('Users.Labels_Details');

    // Set only the title of the breadcrumb leaf, without localization
    this._titleService.setBreadcrumbTitle('Anna Muster', { localize: false });
  }
}
```

See [Translations](../../docs/Practices.Ui/Translations.md#titleservice) for the configuration.

### Translation Support - [`RewriteMissingTranslationHandler`](./src/lib/services/missing-translation.handler.ts)

A `MissingTranslationHandler` for ngx-translate which rewrites the prefix (resource type) of keys without translation, e.g. to
use the translations of your application for the keys of the Practices components:

```typescript
import { providePractices } from '@nexplore/practices-ui';
import { provideTranslateService } from '@ngx-translate/core';

const providers = [
    provideTranslateService(),
    providePractices({
        rewriteResourceConfig: {
            // "Practices.Labels_Save" is looked up as "App.Labels_Save", then as "Shared.Labels_Save"
            rewriteTypeConfig: {
                Practices: { rewriteTo: 'App', fallbackTo: 'Shared' },
            },
            // Optional: how keys without any translation are displayed
            missingKeyTransformFn: (key) => `[${key}]`,
        },
    }),
];
```

See [Translations](../../docs/Practices.Ui/Translations.md) for details.

### Component Lifecycle - [`DestroyService`](./src/lib/services/destroy.service.ts)

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

-   **ListViewSource**: Re-exported from [@nexplore/practices-ng-list-view-source](../practices-ng-list-view-source/README.md)
-   **StatusHubService**: Re-exported from [@nexplore/practices-ng-status](../practices-ng-status/README.md)

For new code, it's recommended to import these directly from their respective packages.

## Integration with Other Libraries

This library complements the modern `practices-ng-*` packages and is used alongside:

-   **[@nexplore/practices-ui-ktbe](../practices-ui-ktbe/README.md)** - KTBE-styled UI component library
-   **[@nexplore/practices-ui-clarity](../practices-ui-clarity/README.md)** - Extensions for Clarity Design System

## Running unit tests

Run `nx test practices-ui` to execute the unit tests.
