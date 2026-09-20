# Signal Forms compatibility matrix

Status: design evidence only. This document does not add a Signal Forms runtime
dependency or claim API compatibility.

Baseline: `origin/main` at `0027e3bfe58bf6447030b8850970c024bf3b559c`, inspected
2026-08-20.

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
- [Migrating existing forms to Signal Forms](https://angular.dev/guide/forms/signals/migration)
- [`form` API](https://angular.dev/api/forms/signals/form)
- [`compatForm` API](https://angular.dev/api/forms/signals/compat/compatForm)
- [`SignalFormControl` API](https://angular.dev/api/forms/signals/compat/SignalFormControl)
- [`FormField` API](https://angular.dev/api/forms/signals/FormField)
- [`FormRoot` API](https://angular.dev/api/forms/signals/FormRoot)
- [Signal Forms comparison](https://angular.dev/guide/forms/signals/comparison)
- [Angular version compatibility](https://angular.dev/reference/versions)
- [Angular versioning and releases](https://angular.dev/reference/releases)
- [Angular 22.1.3 release](https://github.com/angular/angular/releases/tag/v22.1.3)

The migration guide now documents two stable v22 compatibility primitives. `compatForm`
can wrap a model signal containing existing `FormControl` or `FormGroup` instances while
Signal Forms rules apply to other paths. `SignalFormControl` can expose a signal-backed
leaf inside an existing `FormGroup`. This is the official interoperability baseline for
minimal migration effort; it is not evidence that every Reactive Forms API has a Signal
Forms equivalent. The same guide documents that `SignalFormControl` intentionally does
not support imperative `disable()`/`enable()`, dynamic validator mutation, `setErrors()`,
or `markAsPending()`. Those differences must remain explicit compatibility boundaries.

Angular's release documentation treats `next` and release-candidate builds as previews
that may change outside the normal stability policy. Preview-only forms behavior must not
become a required package contract.

Angular `22.1.3` is the latest stable v22 release inspected for this checkpoint. Its
Forms changes include reporting forbidden two-way bindings when `FormField` is applied;
the compatibility layer must preserve that one-way `formField` binding contract and must
not introduce a mixed `[(ngModel)]`/`[formField]` example. The release listing currently
shows `22.2.0-next.3` as a pre-release, so preview-only Forms behavior in that line must
not become a required package contract until it reaches a stable release and the
repository has a focused contract for the behavior.

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
| Factory and builder | `formGroup.withBuilder`, `withType`, `withResetFromSignal`, plus direct factory functions. | `form(modelSignal, schemaOrOptions?)` returns a `FieldTree`; `compatForm` accepts Reactive Forms controls in the model; `SignalFormControl` embeds a signal-backed leaf in a `FormGroup`. | **Compatibility shim required.** Keep the existing names and call shapes. Prefer the official `compatForm`/`SignalFormControl` bridge around existing controls before translating definitions. Do not invent a parallel `formSignal.withBuilder` migration API. |
| Source of truth | `FormGroup`/`FormControl` own the value; `valueSignal` and control signals are projections. | A user-owned writable signal owns the model; `compatForm` can retain a nested Reactive Forms control as a model entry. | **Drop-in requirement.** Preserve existing reads, writes, resets, and signal projections. Do not silently replace a caller-owned control with a different source of truth. |
| Controls and groups | Strongly typed `FormGroup`/`FormControl` definitions and nested group typing. | A field tree mirrors plain object structure and exposes callable field state. | **Compatibility facade.** Translate existing nested definitions to a field tree while preserving the current builder return shape and methods. |
| Arrays | `FormControlArrayValues` exists as a type helper, but the builder and validator paths are FormGroup-oriented; no public FormArray factory is exported. | Arrays are first-class field-tree nodes with stable field identity for iteration. | **Gap.** Array creation, replacement, identity, and validation need explicit contract tests. |
| Initial values and reset | `value`, `nullable` (inverted to Angular's `nonNullable` option), dynamic definition updates, and `reset()` on Reactive Forms controls. | Initial model is a writable signal; field state exposes signal-based value mutation and reset behavior. | **Legacy behavior is authoritative.** Preserve current reset, nullability, and dynamic-definition semantics while synchronizing the Signal Forms model. |
| Disabled and availability | `disabled` is a control-definition option; runtime uses `disable()`/`enable()`. Disabled controls follow Reactive Forms aggregation rules. | `disabled()`, `hidden()`, and `readonly()` are schema rules with field-state signals; `SignalFormControl` intentionally rejects imperative `disable()`/`enable()`. | **Compatibility mapping.** Keep existing `disable()`/`enable()` and aggregate-value behavior for old callers. Do not expose the `SignalFormControl` limitation as a silent behavior change; use declarative rules for the signal-backed lane. |
| Dirty and touched | `dirtySignal`, `pristineSignal`, `touchedSignal`, and `untouchedSignal` are derived from Reactive Forms status/events. | `dirty()` and `touched()` are field-state signals with documented interaction semantics and programmatic marking. | **Compatibility mapping.** Existing state transitions and programmatic methods remain authoritative; add contract tests for disabled/readonly fields and edit-then-revert behavior. |
| Validity and pending state | `statusSignal`, `validSignal`, and `invalidSignal`; async validators use Angular `AsyncValidatorFn`. | `valid()`, `invalid()`, `pending()`, and `errors()` live on `FieldState`. | **Partial parity.** Pending and error-shape conversion are required before any compatibility claim. |
| Validators | Validator arrays plus `conditional`, `dependent`, `async`, `asyncConditional`, and multi-field validation extensions. | Schema/path rules such as `required`, `email`, `validate`, conditional logic, and field-context access (`valueOf`, `stateOf`, `fieldTreeOf`). `compatForm` preserves validators on wrapped Reactive Forms controls. | **Interop first.** Preserve existing `ValidatorFn`/`AsyncValidatorFn` functions on existing controls and allow Signal Forms rules on other schema paths. Do not require same-control dual registration or rewrite every legacy validator until a measured contract proves it is necessary. |
| Async validation | Supported through `AsyncValidatorFn` and conditional effect helpers. | Signal Forms documents pending state and schema-based async validation behavior. | **Unknown until measured.** Test cancellation, pending transitions, stale responses, and error routing independently. |
| Submission | Submission is composed with `practices-ng-commands` and `PuiFormStateService`; the forms package has no `submit()`/`FormRoot` equivalent. | `submit()` validates, marks interactive fields touched, runs an action, routes returned errors, and returns `Promise<boolean>`; `FormRoot` wires form submission. | **Additive compatibility.** Keep existing command/service submission behavior unchanged and expose Signal Forms submission as an additive path. |
| Template directives | `[formGroup][puiForm]`, `[puiFormField]`, readonly behavior, and CVA-oriented wrapper providers. | `[formField]` binds a `FieldTree`; `[formRoot]` handles form submission; custom controls prefer Signal Forms control interfaces while CVA is supported for backwards compatibility. Angular 22.1.3 reports forbidden two-way bindings when `FormField` is applied. | **Separate template surface.** Existing directives must remain unchanged; adapters need explicit imports and examples. Signal Forms examples must use one-way `[formField]` binding and must not combine it with `[(ngModel)]`. |
| Errors | Angular `ValidationErrors | null`, control-level errors, and DOM-oriented invalid-control lookup. | `errors()` returns field-state error objects, including messages and targets for submission errors. | **Compatibility mapping.** Preserve `ValidationErrors` for existing callers while retaining Signal Forms messages and targets for new callers. |
| Value/status observation | RxJS `valueChanges`/`statusChanges` are converted with `toSignal`; utilities also expose filtered/debounced signals and RxJS interop. | Model and field state are signal-first; RxJS is not the source-of-truth contract. | **Optional interop.** Keep RxJS support for the existing package; do not make it a hidden Signal Forms requirement. |
| Custom controls | `provideWrappedFormControlAccessors` combines CVA and validator providers around an underlying Reactive Forms control. | `FormField` supports native controls, Signal Forms control interfaces, and CVA for backwards compatibility. | **Integration point.** A wrapper can be useful, but interface and lifecycle behavior require dedicated tests. |
| Angular/compiler support | Package peers currently stop before Angular 22; development/test dependencies are Angular 19.2.18. | Stable Signal Forms and compatibility APIs are documented from Angular 22.0; the overview requires Angular 21+. | **Separate package boundary.** The Angular 22 Signal Forms adapter is implemented as the separate `@nexplore/practices-ng-forms-signal-forms` package with its own `>=22.0.0 <23.0.0` peer range and an isolated Angular 22 verification lane. The existing `@nexplore/practices-ng-forms` package keeps its Angular 18-21 peer range and verification lane unchanged. |

## Package-boundary decision

The migration target is the separate Angular 22+ package
`@nexplore/practices-ng-forms-signal-forms`, published from
`ng/practices-ng-forms-signal-forms/`. Importing `@angular/forms/signals` requires
an Angular 22 compiler lane, while the existing `@nexplore/practices-ng-forms`
package supports Angular 18-21 and stays on its current peer range. The
separate-package boundary is the accepted split: it gives the Signal Forms
adapter its own `>=22.0.0 <23.0.0` peer range without raising the existing
package's peer range or forcing Angular 22 onto existing Angular 18-21
consumers.

The existing `@nexplore/practices-ng-forms` root API and behavior remain
unchanged. The fluent builder (`formGroup.withBuilder`, `withType`,
`withResetFromSignal`, plus the direct `createFormGroup*` factories) is still
the preferred user-facing path on the Angular 18-21 lane. The new
`@nexplore/practices-ng-forms-signal-forms` package does not list the existing
package as a dependency, is not installed transitively by it, and exposes its
own Angular 22 entry points (`createSignalFormControl`, `SignalFormControl`,
`compatForm`, `form`, `required`, `disabled`, and `submit`). Fluent-builder
integration beyond accepting a `SignalFormControl` as an `AbstractControl`,
including group/array factories and validator parity, remains outside the first
slice.

The `ng/practices-ng-forms-signal-forms/angular-22/` directory is an isolated,
private Angular 22 verification lane for the new package. It exists so the new
package can build, type-check, and run Jest against the official Signal Forms
APIs without disturbing the existing Angular 18-21 lane. The existing
`practices-ng-forms` package must keep its current peer range and continue to
verify against Angular 18-21 on its own lane.

The compatibility layer still provides both lanes:

1. Existing Reactive Forms callers keep using the current validator functions,
   including `ValidatorFn`, `AsyncValidatorFn`, `Validators.*`, conditional and
   dependent helpers, without migration edits. The existing package's API and
   behavior do not change with this split.
2. Signal Forms callers opt into `@nexplore/practices-ng-forms-signal-forms` on
   the Angular 22 lane. `compatForm` and `SignalFormControl` preserve the
   existing Reactive Forms controls and their validator behavior on the paths
   that cross the boundary. The adapter must not imply unsupported same-control
   dual registration or silently drop messages, async pending state, or field
   targets.

## Implemented first slice and next proof

The first slice now lives in the new
`@nexplore/practices-ng-forms-signal-forms` package and is verified against
Angular 22 in the isolated `angular-22/` verification lane. The existing
`@nexplore/practices-ng-forms` fixture set must stay green against Angular
18-21 unchanged.

In the new package:

- Cover `createSignalFormControl`, `SignalFormControl`, `compatForm`, `form`,
  `required`, `disabled`, and `submit` against the official Angular 22 stable
  APIs.
- Exercise a `SignalFormControl` leaf inside an existing `FormGroup` and a
  `FormArray`, bidirectional value/state/error observation, and the documented
  imperative-API limitations: no imperative `disable()`/`enable()` on
  `SignalFormControl`, no dynamic validator mutation, no `setErrors()`, and no
  `markAsPending()`.
- Confirm the published entry points compile against `@angular/forms/signals`
  and `@angular/forms/signals/compat` at the Angular 22 peer boundary.

Keep those contracts running in the isolated lane and keep the existing
`@nexplore/practices-ng-forms` Angular 18-21 lane green in parallel. Broader
fluent-builder integration on the new package remains a later slice. No runtime
Signal Forms dependency is introduced in the existing
`@nexplore/practices-ng-forms` package.
