# Signal Forms compatibility matrix

Status: design evidence only. This document does not add a Signal Forms runtime
dependency or claim API compatibility.

Baseline: `origin/main` at `0027e3bfe58bf6447030b8850970c024bf3b559c`, inspected
2026-08-18.

## Official Angular position

Angular's first-party documentation describes Signal Forms as a signal-backed
form system built around `form(WritableSignal<TModel>, schema?)`, a navigable
`FieldTree`, schema rules, and the `FormField` directive. The API reference marks
`form`, `FormField`, and `FormRoot` stable since Angular v22.0. The overview still
recommends Reactive Forms for existing reactive-form applications and for cases
requiring production-stability guarantees. The overview lists Angular v21 or
higher as the prerequisite, so v21 must be treated as a compatibility boundary,
not as proof of v22-level stability.

Sources:

- [Signal Forms overview](https://angular.dev/guide/forms/signals/overview)
- [`form` API](https://angular.dev/api/forms/signals/form)
- [`FormField` API](https://angular.dev/api/forms/signals/FormField)
- [`FormRoot` API](https://angular.dev/api/forms/signals/FormRoot)
- [Signal Forms comparison](https://angular.dev/guide/forms/signals/comparison)
- [Angular version compatibility](https://angular.dev/reference/versions)

## Repository baseline

The public entrypoint in `ng/practices-ng-forms/src/index.ts` exports:

- the `formGroup` namespace, whose public factories are `withBuilder`,
  `withType`, and `withResetFromSignal`;
- direct factories `createFormGroup`, `createFormGroupWithType`, and
  `createFormGroupWithResetFromSignal`;
- Reactive Forms directives/providers, form-state services, RxJS/signal
  utilities, and validators.

The implementation in `src/lib/form-group-fluent-builder/extensions.ts` creates
Angular `FormGroup` and `FormControl` instances, then adds signal views over
Reactive Forms observables. The package currently develops against Angular
19.2.18 and declares peers `@angular/common`, `@angular/core`, `@angular/forms`,
and `@angular/router` as `>=18.0.0 <22.0.0` in
`ng/practices-ng-forms/package.json`. It also requires RxJS `>=7.0.0 <8.0.0`.

This means the existing package is intentionally a Reactive Forms package with
signal interop, not an implementation of Angular's Signal Forms model.

## Compatibility matrix

The status column records the current evidence and the required next proof. It
is not a percentage compatibility claim.

| Surface | Existing `practices-ng-forms` | Angular Signal Forms | Status and consequence |
| --- | --- | --- | --- |
| Factory and builder | `formGroup.withBuilder`, `withType`, `withResetFromSignal`, plus direct factory functions. | `form(modelSignal, schemaOrOptions?)` returns a `FieldTree`. | **Intentional model difference.** Preserve the fluent API; do not invent a `formSignal.withBuilder` name. |
| Source of truth | `FormGroup`/`FormControl` own the value; `valueSignal` and control signals are projections. | A user-owned writable signal owns the model; field writes update that signal. | **Not drop-in.** An adapter must define ownership and write-back rules first. |
| Controls and groups | Strongly typed `FormGroup`/`FormControl` definitions and nested group typing. | A field tree mirrors plain object structure and exposes callable field state. | **Partial parity.** Nested object paths are conceptually mappable, but the runtime objects and mutation APIs differ. |
| Arrays | `FormControlArrayValues` exists as a type helper, but the builder and validator paths are FormGroup-oriented; no public FormArray factory is exported. | Arrays are first-class field-tree nodes with stable field identity for iteration. | **Gap.** Array creation, replacement, identity, and validation need explicit contract tests. |
| Initial values and reset | `value`, `nullable`, `nonNullable`, dynamic definition updates, and `reset()` on Reactive Forms controls. | Initial model is a writable signal; field state exposes signal-based value mutation and reset behavior. | **Intentional difference to measure.** Define whether reset means model replacement, field-state reset, or both. |
| Disabled and availability | `disabled` is a control-definition option; runtime uses `disable()`/`enable()`. Disabled controls follow Reactive Forms aggregation rules. | `disabled()`, `hidden()`, and `readonly()` are schema rules with field-state signals; non-interactive fields have distinct parent-state behavior. | **Semantic difference.** Do not map these by name alone; test value inclusion and parent validity/state. |
| Dirty and touched | `dirtySignal`, `pristineSignal`, `touchedSignal`, and `untouchedSignal` are derived from Reactive Forms status/events. | `dirty()` and `touched()` are field-state signals with documented interaction semantics and programmatic marking. | **Likely adapter surface, not parity yet.** Test programmatic marking, disabled/readonly fields, and edit-then-revert behavior. |
| Validity and pending state | `statusSignal`, `validSignal`, and `invalidSignal`; async validators use Angular `AsyncValidatorFn`. | `valid()`, `invalid()`, `pending()`, and `errors()` live on `FieldState`. | **Partial parity.** Pending and error-shape conversion are required before any compatibility claim. |
| Validators | Validator arrays plus `conditional`, `dependent`, `async`, `asyncConditional`, and multi-field validation extensions. | Schema/path rules such as `required`, `email`, `validate`, conditional logic, and field-context access (`valueOf`, `stateOf`, `fieldTreeOf`). | **Conceptual overlap with different binding model.** Make validator translation explicit and preserve message/error provenance. |
| Async validation | Supported through `AsyncValidatorFn` and conditional effect helpers. | Signal Forms documents pending state and schema-based async validation behavior. | **Unknown until measured.** Test cancellation, pending transitions, stale responses, and error routing independently. |
| Submission | Submission is composed with `practices-ng-commands` and `PuiFormStateService`; the forms package has no `submit()`/`FormRoot` equivalent. | `submit()` validates, marks interactive fields touched, runs an action, routes returned errors, and returns `Promise<boolean>`; `FormRoot` wires form submission. | **Gap.** Submission behavior should be a separate focused slice, not hidden inside a builder adapter. |
| Template directives | `[formGroup][puiForm]`, `[puiFormField]`, readonly behavior, and CVA-oriented wrapper providers. | `[formField]` binds a `FieldTree`; `[formRoot]` handles form submission; custom controls prefer Signal Forms control interfaces while CVA is supported for backwards compatibility. | **Separate template surface.** Existing directives must remain unchanged; adapters need explicit imports and examples. |
| Errors | Angular `ValidationErrors | null`, control-level errors, and DOM-oriented invalid-control lookup. | `errors()` returns field-state error objects, including messages and targets for submission errors. | **Representation difference.** Define a lossless mapping or document intentional loss; do not silently stringify errors. |
| Value/status observation | RxJS `valueChanges`/`statusChanges` are converted with `toSignal`; utilities also expose filtered/debounced signals and RxJS interop. | Model and field state are signal-first; RxJS is not the source-of-truth contract. | **Optional interop.** Keep RxJS support for the existing package; do not make it a hidden Signal Forms requirement. |
| Custom controls | `provideWrappedFormControlAccessors` combines CVA and validator providers around an underlying Reactive Forms control. | `FormField` supports native controls, Signal Forms control interfaces, and CVA for backwards compatibility. | **Integration point.** A wrapper can be useful, but interface and lifecycle behavior require dedicated tests. |
| Angular/compiler support | Package peers currently stop before Angular 22; development/test dependencies are Angular 19.2.18. | Stable APIs are documented from Angular 22.0; the overview requires Angular 21+. | **Boundary blocker.** A single package cannot honestly promise existing Angular 18-21 support and stable Signal Forms support without an isolated build/version contract. |

## Package-boundary decision

The evidence does not support adding Signal Forms directly to the existing root
API in the next implementation slice. The package already has a forms-related
home and already uses signals, but three boundaries are material:

1. The current public contract is built around Reactive Forms objects and must
   keep its fluent builder behavior.
2. The current peer range includes Angular 18-21 but excludes Angular 22, while
   the stable Signal Forms APIs are documented from Angular 22. A static import
   of `@angular/forms/signals` cannot be compiled and tested against the current
   Angular 19 workspace without changing that baseline.
3. Signal Forms changes the source of truth, template directives, error model,
   submission lifecycle, and availability semantics. These are package-level
   contracts, not a small internal refactor.

Therefore, a parallel Signal Forms package or an explicitly isolated secondary
build is currently safer than changing `@nexplore/practices-ng-forms` in place.
The exact package name and whether a secondary entrypoint can provide equivalent
dependency isolation remain open design decisions. The existing package root
and its fluent Reactive Forms API must remain stable either way.

## Next bounded slice

Before implementation, add contract fixtures that exercise the matrix's highest-
risk rows: arrays, disabled/readonly state, async validation cancellation,
error mapping, and submission. The fixture must compile against the intended
Angular 21/22 boundary and be isolated from the current Angular 19 workspace.
Only after those contracts pass should a separate implementation PR choose a
package name and add peer/build metadata. No runtime Signal Forms dependency is
introduced by this matrix.
