# @nexplore/practices-ng-forms

This library provides an enhanced set of utilities for working with Angular Reactive Forms, with a focus on integration with Angular Signals and improved developer experience through fluent APIs.

## Purpose

Angular's Reactive Forms provide a powerful foundation for managing form state, but they lack integration with Angular's new signals API and can be verbose to configure. This library bridges these gaps, offering a more intuitive, chainable API for creating and configuring forms with built-in signals integration, advanced validation capabilities, and form effects.

## Features

- **Fluent Form Builder API** - Create and configure forms with a chainable, TypeScript-friendly API
- **Signal Integration** - Built-in integration with Angular Signals for reactive state management
- **Dependent Validation** - Define validators that depend on other form fields' values
- **Conditional Validation** - Apply validation rules conditionally based on external signals
- **Multi-Field Validation** - Create validation rules that span multiple form controls
- **Form Effects** - React to form changes with effect functions
- **Form Reset from Signal** - Automatically reset forms when input signals change
- **Form State Management** - Tools for tracking and managing form dirty states
- **Control Wrapper** - A utility to make writing form control enabled components easier
- **Form Field** - A collection of services and directives for implementing form logic when creating custom component libraries

## Installation

```bash
pnpm install @nexplore/practices-ng-forms
```

## Features and Usage Examples

### Fluent Form Builder API - [`formGroup`](./src/lib/form-group-fluent-builder/index.ts)

Create and configure forms with a chainable, TypeScript-friendly API:

```typescript
import { formGroup } from '@nexplore/practices-ng-forms';
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';

@Component({...})
export class UserFormComponent {
  protected readonly userForm = formGroup
    .withBuilder(({ control }) => ({
      firstName: control<string>(''),
      lastName: control<string>(''),
      email: control<string>(''),
      age: control<number | null>(null)
    }))
    .withValidation({
      firstName: [Validators.required],
      lastName: [Validators.required],
      email: [Validators.required, Validators.email],
      age: [Validators.min(18)]
    });

  // Accessing values via signals
  protected readonly fullNameSignal = computed(() => {
    const firstName = this.userForm.value.firstNameSignal();
    const lastName = this.userForm.value.lastNameSignal();
    return `${firstName} ${lastName}`;
  });
}
```

**Alternative API:** Direct factory functions are also available if you prefer not to use the fluent `formGroup.with*` syntax:

- [`createFormGroup`](./src/lib/form-group-fluent-builder/create-form-group.ts)
- [`createFormGroupWithType`](./src/lib/form-group-fluent-builder/create-form-group-with-type.ts)
- [`createFormGroupWithResetFromSignal`](./src/lib/form-group-fluent-builder/create-form-group-with-reset-from-signal.ts)

### Signal Integration

Access form values and state through Angular signals for reactive updates:

```typescript
const userForm = formGroup.withBuilder(({ control }) => ({
    firstName: control<string>(''),
    lastName: control<string>(''),
}));

// Form status signals
const isDirty = userForm.dirtySignal(); // Whether the form is dirty
const isValid = userForm.validSignal(); // Whether the form is valid
const isInvalid = userForm.invalidSignal(); // Whether the form is invalid

// Access individual form control values as signals:
const firstName = userForm.value.firstNameSignal(); // Signal-based access
const lastName = userForm.value.lastNameSignal(); // Signal-based access
```

### Dependent Validation - [`withValidation` with `dependent`](./src/lib/form-group-fluent-builder/with-validation.ts)

Create validators that depend on other form fields:

```typescript
import { formGroup } from '@nexplore/practices-ng-forms';
import { Validators } from '@angular/forms';

const registrationForm = formGroup
    .withBuilder(({ control }) => ({
        email: control<string>(''),
        password: control<string>(''),
        confirmPassword: control<string>(''),
        age: control<number | null>(null),
        parentConsent: control<boolean>(false),
    }))
    .withValidation(({ dependent }) => ({
        email: [Validators.required, Validators.email],
        password: [Validators.required, Validators.minLength(8)],
        confirmPassword: [
            Validators.required,
            dependent(({ password, confirmPassword }) => password !== confirmPassword && { passwordMismatch: true }),
        ],
        age: [Validators.required],
        parentConsent: [dependent(({ age }) => age < 18 && Validators.requiredTrue)],
    }));
```

### Conditional Validation - [`withValidation` with `conditional`](./src/lib/form-group-fluent-builder/with-validation.ts)

Apply validation rules conditionally based on external signals:

```typescript
import { formGroup } from '@nexplore/practices-ng-forms';
import { Component, signal } from '@angular/core';
import { Validators } from '@angular/forms';

@Component({...})
export class ConditionalValidationComponent {
  // External state that affects form validation
  protected readonly isAdvancedModeSignal = signal(false);
  protected readonly minimumAgeSignal = signal(18);

  protected readonly userForm = formGroup
    .withBuilder(({ control }) => ({
      email: control<string>(''),
      phone: control<string>(''),
      age: control<number | null>(null),
      biography: control<string>('')
    }))
    .withValidation(({ conditional }) => ({
      // Email is required only in advanced mode
      email: [
        Validators.email,
        conditional(() => this.isAdvancedModeSignal() && Validators.required)
      ],
      // Phone validation depends on if advanced mode is enabled
      phone: [
        conditional(() => {
          // Return different validators based on mode
          return this.isAdvancedModeSignal()
            ? [Validators.required, Validators.pattern(/^\+\d{1,3}\s\d{6,14}$/)]
            : Validators.required;
        })
      ],
      // Dynamic minimum age validation
      age: [
        Validators.required,
        conditional(() => Validators.min(this.minimumAgeSignal()))
      ],
      // Biography is required only in advanced mode and must have minimum length
      biography: [
        conditional(() => {
          if (this.isAdvancedModeSignal()) {
            return [Validators.required, Validators.minLength(50)];
          }
          return null;
        })
      ]
    }));

  // Toggle advanced mode
  protected toggleAdvancedMode() {
    this.isAdvancedModeSignal.update(value => !value);
    // Form validation will automatically update
  }
}
```

### Form Reset from Signal - [`withResetFromSignal`](./src/lib/form-group-fluent-builder/with-reset-from-signal.ts)

Reset forms automatically when an input signal changes:

```typescript
import { formGroup } from '@nexplore/practices-ng-forms';
import { Component, inject, input } from '@angular/core';
import { UserService } from './user.service';

@Component({...})
export class UserEditorComponent {
  private readonly _userService = inject(UserService);

  public readonly userIdSignal = input<string | null>(null);

  protected readonly userQuery = command.query.withSignalTrigger(
    this.userIdSignal,
    (id) => this._userService.getUser(id)
  );

  protected readonly userForm = formGroup
    .withBuilder(({ control }) => ({
      firstName: control<string>(''),
      lastName: control<string>(''),
      email: control<string>('')
    }))
    .withResetFromSignal(this.userQuery.resultSignal);

  // The form will automatically reset with user data when the query completes
}
```

#### Direct Use of `withResetFromSignal` Factory

For even simpler form setup, you can directly use the `formGroup.withResetFromSignal` factory function:

```typescript
import { formGroup } from '@nexplore/practices-ng-forms';
import { Component, inject, input } from '@angular/core';
import { UserService } from './user.service';

@Component({...})
export class UserEditorComponent {
  private readonly _userService = inject(UserService);

  public readonly userIdSignal = input<string | null>(null);

  protected readonly userQuery = command.query.withSignalTrigger(
    this.userIdSignal,
    (id) => this._userService.getUser(id)
  );

  protected readonly userForm = formGroup.withResetFromSignal(
      this.userSignal,
      {
          firstName: { nullable: true },
          lastName: { nullable: true },
          email: { nullable: true }
      }
  ); // Form value fields will all be null by default, until query has loaded

  // The form will automatically reset with user data when the query completes
}
```

If you are using a required input and are sure, that all fields are initialized, you can simply do the same with `nullable: false`

```typescript
import { formGroup } from '@nexplore/practices-ng-forms';
import { Component, inject, input } from '@angular/core';

@Component({...})
export class UserEditorComponent {
  // Using required input ensures value is always present
  public readonly userSignal = input.required<User>({ alias: 'user' });

  // Simplified configuration for non-nullable values
  protected readonly userForm = formGroup.withResetFromSignal(
    this.userSignal,
    {
      firstName: { nullable: false },
      lastName: { nullable: false },
      email: { nullable: false }
    }
  );
}
```

### Form Value Change Effects - [`withValueChangeEffect`](./src/lib/form-group-fluent-builder/with-value-change-effect.ts)

React to specific form value changes:

```typescript
import { formGroup } from '@nexplore/practices-ng-forms';
import { Component, inject } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Component({...})
export class SearchFormComponent {
  private readonly _analytics = inject(AnalyticsService);

  protected readonly searchForm = formGroup
    .withBuilder(({ control }) => ({
      query: control<string>(''),
      category: control<string | null>(null),
      includeArchived: control<boolean>(false)
    }))
    .withValueChangeEffect(({ query, category }) => { // Will only trigger when query or category changes
      if (query && query.length > 3) {
        this._analytics.trackSearch(query, category);
      }
    });
}
```

### Multi-Field Validation - [`withMultiFieldValidation`](./src/lib/form-group-fluent-builder/with-validation-multi-field.ts)

Define validation rules that depend on multiple fields:

```typescript
import { formGroup } from '@nexplore/practices-ng-forms';
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';

@Component({...})
export class RegistrationFormComponent {
  protected readonly registrationForm = formGroup
    .withBuilder(({ control }) => ({
      password: control<string>(''),
      confirmPassword: control<string>(''),
      startDate: control<Date | null>(null),
      endDate: control<Date | null>(null)
    }))
    .withValidation({
      password: [Validators.required, Validators.minLength(8)],
      confirmPassword: [Validators.required],
      startDate: [Validators.required],
      endDate: [Validators.required]
    })
    // Password confirmation validation
    .withMultiFieldValidation(({ password, confirmPassword }) => {
      if (password && confirmPassword && password !== confirmPassword) {
        return { passwordMismatch: true };
      }
      return null;
    })
    // Date range validation
    .withMultiFieldValidation(({ startDate, endDate }) => {
      if (startDate && endDate && startDate > endDate) {
        return { invalidDateRange: 'Start date must be before end date' };
      }
      return null;
    }, ['endDate']); // Only apply the error to this field
}
```

### Form State Management - [`PuiFormStateService`](./src/lib/form-state/form-state.service.ts)

Utilities for managing form state, validation, and navigation guards:

```typescript
import { PuiFormStateService } from '@nexplore/practices-ng-forms';
import { Component, inject } from '@angular/core';

@Component({...})
export class UserFormComponent {
  private readonly _formStateService = inject(PuiFormStateService);
  private readonly _userService = inject(UserService);

  protected readonly userForm = formGroup.withBuilder(...)
    .withValidation(...);

  protected saveUser() {
    // Validate form, handle focus on first invalid field, and manage dirty guard automatically
    this._formStateService.runWithFormValidityCheck(this.userForm, () => {
      // Only executes if form is valid
      return this._userService.saveUser(this.userForm.value);
    });
  }

  protected navigateAway() {
    // Temporarily disable the dirty guard during navigation
    this._formStateService.runWithoutDirtyGuard(() => {
      this._router.navigate(['/dashboard']);
    });
  }
}
```

### Form Submission with Commands - [`command.actionSaveForm`](../practices-ng-commands/src/lib/command-fluent-builder/create-save-form-command.ts)

When using the `@nexplore/practices-ng-commands` library, you can leverage the `command.actionSaveForm` utility:

```typescript
import { command } from '@nexplore/practices-ng-commands';
import { Component, inject } from '@angular/core';

@Component({...})
export class UserFormComponent {
  private readonly _userService = inject(UserService);

  protected readonly userForm = formGroup.withBuilder(...)
    .withValidation(...);

  // Create a command that validates the form before execution
  protected readonly saveCommand = command.actionSaveForm(
    () => this.userForm,
    (formValue) => this._userService.saveUser(formValue)
  );

  // In template: <button [disabled]="saveCommand.disabledSignal()" (click)="saveCommand.trigger()">Save</button>
}
```

### Readonly Mode for Form Fields

To display form fields as **readonly**, use the `puiReadonly` directive at any level in your DOM. All child form fields will automatically render in readonly mode.

If you want to **exclude** specific form fields from being readonly, you can reapply the directive with `[puiReadonly]="false"` on those specific fields.

#### Disable Validators on Readonly Fields

To automatically add and remove validators from FormFields when the `puiReadonly` directive is applied, add the `removeValidatorsOnReadonlyFieldsBehavior` option to your `PuiFormFieldConfig`.
You can also pass in specific Validators that you want to preserve. These preserved Validators will be reapplied separately after the readonly state changes, ensuring that the `hasValidators` function continues to return accurate results even after validators are removed and reapplied.

Note: This does not work with conditional validators, because conditional validators are dynamically generated based on external signals or state and are not statically attached to the form control. As a result, when validators are removed and reapplied (such as when toggling readonly mode), conditional validators may not be restored correctly, leading to missing or inconsistent validation. Users should avoid relying on automatic validator removal and restoration for fields that use conditional validators, and instead manage such validators explicitly if needed.

## Integration with Other Libraries

### practices-ng-dirty-guard

The library works seamlessly with [`@nexplore/practices-ng-dirty-guard`](../practices-ng-dirty-guard/README.md) for form dirty state protection:

```html
<form [formGroup]="myFormGroup" puiForm [enableDirtyFormNavigationGuard]="true">
    <!-- Form fields -->
</form>
```

### practices-ng-commands

For form submission, the library integrates with [`@nexplore/practices-ng-commands`](../practices-ng-commands/README.md):

```typescript
import { formGroup } from '@nexplore/practices-ng-forms';
import { command } from '@nexplore/practices-ng-commands';

const form = formGroup.withBuilder(...)
  .withValidation(...);

const saveCommand = command.actionSaveForm(
  () => form,
  (formValue) => saveData(formValue)
);
```

### practices-ng-signals

The library leverages [`@nexplore/practices-ng-signals`](../practices-ng-signals/README.md) for signal-based reactivity.

## Running unit tests

Run `nx test practices-ng-forms` to execute the unit tests.

