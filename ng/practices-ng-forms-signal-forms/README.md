# @nexplore/practices-ng-forms-signal-forms

An opt-in Angular 22 adapter boundary for using Angular's official Signal Forms
controls inside Reactive Forms code.

```ts
import { FormGroup } from '@angular/forms';
import {
    createSignalFormControl,
    required,
} from '@nexplore/practices-ng-forms-signal-forms';

const form = new FormGroup({
    name: createSignalFormControl('', (path) => required(path)),
});
```

`createSignalFormControl` returns Angular's `SignalFormControl`, so it can be placed
in a normal `FormGroup` or `FormArray`. The package also exposes the official
`compatForm`, `form`, `required`, and `submit` entry points for incremental migration.
Use Signal Forms' `disabled` rule for availability state; Angular intentionally does
not support imperative `SignalFormControl.disable()` or `.enable()` calls.

## Compatibility boundary

The compat APIs used here are marked stable since Angular v22.0. Signal Forms still
represent a newer form model, and Angular recommends Reactive Forms for existing
applications that need production-stability guarantees.

This is a separate package because importing `@angular/forms/signals` requires an
Angular 22 compiler lane while the existing `@nexplore/practices-ng-forms` package
supports Angular 18–21. The existing package is not changed or installed
transitively. Fluent-builder integration beyond accepting a `SignalFormControl` as
an `AbstractControl`, including group/array factories and validator parity, remains
outside this first slice.

The `angular-22` directory is an isolated verification lane and is not a published
package.
