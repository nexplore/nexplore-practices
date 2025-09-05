# @nexplore/practices-ng-dirty-guard

This library provides a comprehensive solution for preventing users from accidentally navigating away from forms with unsaved changes in Angular applications.

## Purpose

The dirty guard system acts as a safety net for users working with forms in Angular applications. It detects when a form has unsaved changes and prompts the user with a confirmation dialog before allowing navigation that would result in data loss.

## Features

-   **Navigation Guard** - Prevents accidental navigation when forms have unsaved changes
-   **Configurable Dialog** - Customizable confirmation dialog for discarding changes
-   **Multiple Form Support** - Tracks dirty state across multiple forms in the same view
-   **Router Integration** - Works with Angular Router for both internal and external navigation
-   **Signal-based API** - Modern Angular API using signals
-   **Nested Routes Support** - Works with nested router-outlets
-   **Programmatic Control** - API for temporarily disabling guards when needed

## Installation

```bash
npm install @nexplore/practices-ng-dirty-guard
```

## Features and Usage Examples

### Navigation Guard - [`PuiDirtyGuardDirective`](./src/lib/directives/dirty-guard.directive.ts)

Prevents accidental navigation when forms have unsaved changes. Apply the directive to your router-outlet:

```typescript
import { provideDirtyGuard } from '@nexplore/practices-ng-dirty-guard';

bootstrapApplication(AppComponent, {
    providers: [
        // ... other providers
        provideDirtyGuard({
            evaluateDiscardChangesAsyncHandler: () => {
                // Return a Promise<boolean> or Observable<boolean> that resolves to true if the user confirms discard
                return window.confirm('You have unsaved changes. Do you want to discard them?');
            },
        }),
    ],
});
```

Then, in your app component template:

```html
<router-outlet puiDirtyGuard></router-outlet>
```

### Multiple Form Support

The dirty guard can track multiple forms in the same view, aggregating their dirty state:

```html
<form [formGroup]="personalInfoForm" puiForm [enableDirtyFormNavigationGuard]="true">
    <!-- Personal info fields -->
</form>

<form [formGroup]="addressForm" puiForm [enableDirtyFormNavigationGuard]="true">
    <!-- Address fields -->
</form>
```

### Nested Routes Support - [`PuiNestedDirtyGuardDirective`](./src/lib/directives/nested-dirty-guard.directive.ts)

For applications using nested router-outlets, use the `PuiNestedDirtyGuardDirective` to ensure the dirty guard works properly in child routes:

```typescript
// Import the directive
import { PuiNestedDirtyGuardDirective } from '@nexplore/practices-ng-dirty-guard';

@Component({
    // ...
    imports: [RouterOutlet, PuiNestedDirtyGuardDirective],
})
export class ParentComponent {}
```

```html
<!-- Apply the directive to nested router-outlets -->
<router-outlet puiNestedDirtyGuard></router-outlet>
```

The directive automatically handles activation and deactivation of child components in the nested routes, ensuring that dirty form states are properly tracked across all route levels.

### Programmatic Control - [`PuiGlobalRouteGuardService`](./src/lib/services/global-route-guard.service.ts)

For programmatic control of the dirty guard, you can inject and use the `PuiGlobalRouteGuardService`:

```typescript
import { PuiGlobalRouteGuardService } from '@nexplore/practices-ng-dirty-guard';
import { Component, inject } from '@angular/core';

@Component({...})
export class MyComponent {
  private readonly _globalRouteGuardService = inject(PuiGlobalRouteGuardService);

  // Temporarily disable all guards
  disableAllGuards() {
    this._globalRouteGuardService.disabled = true;
  }

  // Re-enable all guards
  enableAllGuards() {
    this._globalRouteGuardService.disabled = false;
  }

  // Programmatically check for unsaved changes
  checkForUnsavedChanges() {
    this._globalRouteGuardService.requestUnsavedChangesDialogIfAnyDirty((canDeactivate) => {
      if (canDeactivate) {
        // User chose to discard changes
        console.log('Changes will be discarded');
      } else {
        // User chose to stay on page
        console.log('User wants to keep changes');
      }
    });
  }
}
```

> **Note:** The preferred way to programmatically control the dirty guard in real applications is through the `PuiFormStateService` from `@nexplore/practices-ng-forms`, which provides a more abstracted API with additional functionality:

```typescript
import { PuiFormStateService } from '@nexplore/practices-ng-forms';
import { Component, inject } from '@angular/core';

@Component({...})
export class MyComponent {
  private readonly _formStateService = inject(PuiFormStateService);

  // Temporarily disable the dirty guard
  disableDirtyGuard() {
    this._formStateService.disableDirtyGuard(true);
  }

  // Run a function with the dirty guard disabled, and automatically re-enable it
  async saveAndNavigate() {
    await this._formStateService.runWithoutDirtyGuard(() => {
      // Save data and navigate away
      // The dirty guard will be automatically re-enabled after this function completes
    });
  }

  // Check form validity and disable dirty guard in one step
  async saveWithValidityCheck() {
    await this._formStateService.runWithFormValidityCheck(
      this.myForm,
      () => this.saveDataAndNavigate(),
      {
        // Optional callbacks and settings
        validCallback: () => console.log('Form is valid')
      }
    );
  }
}
```

## Integration with Other Libraries

### Integration with @nexplore/practices-ng-forms

The [`@nexplore/practices-ng-forms`](../practices-ng-forms/README.md) package provides a convenient `puiForm` directive with built-in dirty guard support:

```html
<form [formGroup]="myFormGroup" puiForm [enableDirtyFormNavigationGuard]="true">
    <!-- Form fields -->
</form>
```

The `enableDirtyFormNavigationGuard` input activates the dirty guard for the form. When enabled, if the user tries to navigate away while the form has unsaved changes (is DIRTY), the dirty guard dialog will be displayed.

### UI Integration with @nexplore/practices-ui-ktbe

The [`@nexplore/practices-ui-ktbe`](../practices-ui-ktbe/README.md) package provides a complete UI implementation for the dirty guard, including a styled confirmation dialog that follows the Kanton Bern design guidelines.

You can use the `providePracticesKtbe()` helper which includes the dirty guard provider:

```typescript
import { providePracticesKtbe } from '@nexplore/practices-ui-ktbe';

bootstrapApplication(AppComponent, {
    providers: [
        // ... other providers
        providePracticesKtbe(),
    ],
});
```

If you don't want to use all features of the Ktbe library, you can also ONLY provide the config for the dirty guard dialog:

```typescript
import { providePuibeDirtyGuard } from '@nexplore/practices-ui-ktbe';

bootstrapApplication(AppComponent, {
    providers: [
        // ... other providers
        providePuibeDirtyGuard(), // Uses a styled dialog from practices-ui-ktbe
    ],
});
```

## Running unit tests

Run `nx test practices-ng-dirty-guard` to execute the unit tests.
