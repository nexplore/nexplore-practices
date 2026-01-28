# Changelog

All notable changes to this library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added

- `Practices.*` Add support for .NET 10
- `practices-ng-*`, `practices-ui`, `practices-ui-ktbe` Add support for Angular 21

### Changed

- `Practices.Core` Update Autofac to 9.0.0
- `Practices.Mail` Update MailKit to 4.14.1
- `Practices.Syncfusion.Excel` Update Syncfusion.XlsIO.Net.Core to 31.2.18
- `Practices.Syncfusion.Pdf` Update Syncfusion.Pdf.Net.Core to 31.2.18
- `practices-ui-ktbe` Added `whitespace-pre-line` CSS class to `PuibeReadonlyLabelValueComponent` to properly display line breaks in readonly values.
- `practices-ng-forms` Updated `toFormControlOptions` nonNullable behavior.
- _BREAKING_ `practices-ng-forms` Removed `AbstractControl` from `FormGroupDefinitionRecord` to limit configuration to supported properties.

### Fixed

- `practices-ng-forms` Fixed form group fluent builder to apply `validators` and `asyncValidators` from control definitions.
- `practices-ui-ktbe` Fixed `PuibeHideIfEmptyTextDirective` to work with projected elements in the directive tree.

## [11.1.0](https://github.com/nexplore/nexplore-practices/releases/tag/11.1.0) - 2025-12-10

### Added

- `practices-ng-forms` Added `provideWrappedFormControlAccessors` ability to override `setDisabledState`.
- `practices-ng-status` Added support for filtering status events via a configurable `filter` property in `StatusHubConfig` (ignored by default: AbortError DOMExceptions).
- `practices-ng-forms` Added hybrid `formGroup.valueSignal` accessor that works as a signal for the whole form value while still exposing individual control signals.

### Changed

- `practices-ng-forms` Improved signal enhanced form group factory to not trigger unnecessary events when setting initial values/configuration.
- `practices-ng-forms` Accessing control signals via `formGroup.value.<prop>Signal` now logs a deprecation warning to steer consumers to `valueSignal`.
- `practices-ng-forms` Improved `WrapperFormControlAccessor` to support signals and partial form groups, enhanced value/validation handling, and deprecated `getValueAccessorEntityDtoSignal` in favor of `getValueAccessorEntityDtoSignalToAutoResetForm`.
- `practices-ng-list-view-source` Improved typing and API for `selectViewSource` and related fluent builders:
  - Added support for default filter type when no label key is provided.
    When a label is defined, the filter now only consists of the label.

### Fixed

- `practices-ng-commands` Fixed `command.fromInput` to properly handle legacy commands when `mapArguments` is configured.
- `practices-ui-ktbe` Fixed `PuibeCheckboxComponent` touched initial value not emitting.
- `practices-ui-ktbe` Fixed typo in `PuibeReadonyLabelValueComponent`, renamed to `PuibeReadonlyLabelValueComponent`. Deprecated `PuibeReadonyLabelValueComponent`.
- `practices-ui-ktbe` Fixed `PuibeReadonlyLabelValueComponent` styling, to break long words when they are overflowing.
- `practices-ng-commands` Fixed `Command.cancel()` to abort even when the handler was returning a promise instead of an observable.
- `practices-ng-commands` Fixed `command.query.withSignalTrigger()` typing to reflect null/undefined args behavior.
- `practices-ng-list-view-source` Fixed table view source column `sortDir` not synchronizing with persisted ordering parameters, plus improved typing of fluent api.
- `practices-ng-list-view-source` Fixed table view source `withFilterForm` behavior in combination with `withPersistedParams`, changed timing of when filter form values are applied to the view source.
- `practices-ui-ktbe` Fixed `PuibeSelectDirective` not handling NULL values after initialization, Now observes changes to the bound value and updates the selection accordingly.

## [11.0.0](https://github.com/nexplore/nexplore-practices/releases/tag/11.0.0) - 2025-11-06

> New major version due to open-sourcing of the project.

### Added

- `practices-ui-ktbe` Add `PuibeTableRowActionTriggerDirective` input `puibeTableRowActionTriggerDisabled` to disable the trigger.
- `practices-ng-forms` Add `shouldShowOptionalFlagFn` to form config, adding the ability to override the default condition for when the "conditional" label should be rendered.
- `practices-ui-ktbe` Add `PuibeBreadcrumbComponent` input `hideCurrentlyActiveItem` for further customization.
- `Practices.*` Add support for .NET 9 and .NET 8 by switching to multi-targeting.
- `Practices.Syncfusion.Pdf` Add functionality to facilitate generating pdf files using the Syncfusion library.
- `Practices.Syncfusion.Excel` Add context away column value converters.
- `practices-ui-ktbe` Add `PuibeExpansionPanelComponent` input `compact` for smaller accordions and new color `variant` 'light-sand'.
- `practices-ui-ktbe` Add `PuibeSideOverlayPanelService` to display additional information on the right side of the screen, hidden in a drawer like side panel.
- `practices-ui-ktbe` Add `PuibeTimelineItemComponent` that can be used to display a history or process-visualization.
- `practices-ng-forms` Added a new config to disable validation on readonly form fields.

### Changed

- `practices-ui-clarity` Add support for angular 19
- _BREAKING_ `practices-ui`, `practices-ui-clarity`, `practices-ui-ktbe`, `practices-ng-commands`, `practices-ng-common-util`, `practices-ng-dirty-guard`, `practices-ng-forms`, `practices-ng-list-view-source`, `practices-ng-logging`, `practices-ng-signals`, `practices-ng-status` Set minimum supported angular version to v18, Updated all libs and demo apps.
- Migrated Angular related projects to Nx workspace.
- _BREAKING_ `Practices.*` Update third party libraries (Major updates: Autofac from 8.0.0 to 8.3.0 and Autofac.Extensions.DependencyInjection from 9.0.0 to 10.0.0)
- `Practices.*` Updated .NET Libraries from 9.0.3 to 9.0.7
- `Practices.Practices.Mail` Updated MailKit from 4.11.0 to 4.13.0
- `Practices.Syncfusion.Excel` Updated Syncfusion libs to version 30.1.42.
- `Practices.Syncfusion.Pdf` Updated Syncfusion libs to version 30.1.42, SixLabors.ImageSharp from 3.1.8 to 3.1.11
- `Practices.Tests` Updated Testcontainers.MsSql from 4.4.0 to 4.6.0
- `Practices.Syncfusion.Excel` Include Headers in Excel exports of empty datasources.
- _BREAKING_ `Practices.Syncfusion.Excel` Add `IAsyncEnumerable` as datasource and changed datasource `IEnumerable` to an asynchronous implementation.
- `Practices.Core` Add support for convert expressions in property paths.
- `practices-ui-ktbe` Deprecate `PuibeClickCommandDirective` in favor of `PuiClickCommandDirective` from `@nexplore/practices-ng-commands`.
- `practices-ui-ktbe` Refactor `PuibeActionDialogService` to accept `PuiClickCommandDirective` from `@nexplore/practices-ng-commands`.
- `practices-ui-ktbe` Refactor `PuibeButtonDirective` and `PuibeTeaserComponent` to host `PuibeMigratingClickCommandHostDirective`, accepting both legacy and modern commands from `@nexplore/practices-ng-commands`.
- _BREAKING_ `practices-ui` Remove `CommandTriggerOptions`, `CommandAfterExecuteResult`, `CommandAsyncHandlerResult`, `CommandAsyncHandlerFn`, `CommandAsyncHandlerArg`, to avoid duplicate definitions with `@nexplore/practices-ng-commands`.
- _BREAKING_ `practices-ui` Renamed `CommandOptions`, `CommandTriggerOptions` to `LegacyCommandOptions`, `LegacyCommandTriggerOptions` to avoid confusion with `@nexplore/practices-ng-commands`.
- _BREAKING_ `practices-ui-ktbe` Re-export form field directives and service from `@nexplore/practices-ng-forms`, `[puibeForm]` must now be declared on a element with a `[formGroup]`, instead of any `form` tag.
- `practices-ui-ktbe` Refactor all Form based components to use the new directives and services from `@nexplore/practices-ng-forms` underneath.
- `practices-ui-ktbe` Refactor `PuibeGlobalDirtyGuardDirective` and all related code to use implementation from `@nexplore/practices-ng-dirty-guard`.
- _BREAKING_ `practices-ui-ktbe` Removed `PuibeGlobalDirtyGuardDirective` output `dirtyGuardEvents`.
- _BREAKING_ `practices-ui-ktbe` In order for the dirty guard to work, `providePracticesKtbe()` has to be added to the application providers, as it configures the dirty guard to use the proper action dialog user interface.
- `practices-ui-ktbe` Re-export all list/table/select-view-source related classes from `@nexplore/practices-ng-list-view-source`.
- `practices-ui` Deprecate `createListViewSource()`, use new `tableViewSource` factory extensions from `@nexplore/practices-ng-list-view-source`.
- `practices-ng-list-view-source`, `practices-ng-commands`, `practices-ng-forms` Introduce new factory extensions for `tableViewSource`, `selectViewSource`, `command` and `formGroup` from `@nexplore/practices-ng-list-view-source`, `@nexplore/practices-ng-commands` and `@nexplore/practices-ng-forms`.
- _BREAKING_ `practices-ui-ktbe` Updated date-fns to use minimum v4
- _BREAKING_ `practices-ui-ktbe` Updated `PuibeActionDialogService` to use `Command` from `@nexplore/practices-ng-commands` and no longer accepts `LegacyCommand`, also `createShowCommand` now returns new command with sligthly different api (eg. trigger now returns `void` instead of `boolean`)
- _BREAKING_ `practices-ui-ktbe` Updated `FormFieldService` method `emitIconClick` to require an `MouseEvent` instance.
- `practices-ui-ktbe` Update peer dependency for "@ng-select/ng-select" to support version range >=13.0.0 <15.0.0
- `practices-ui-ktbe` Update peer dependency for "@ngx-translate/core" to support version range >=15.0.0 <17.0.0
- _BREAKING_ `Practices.*` Add `CancellationToken` and use `ConfigureAwait(false)` for async operations.
- _BREAKING_ `Nexplore.Practices.EntityFramework` Align signature of `Apply` and `ApplyWithMap` in `AsyncQueryParamsApplier` and `SyncQueryParamsApplier` to naming conventions.
- _BREAKING_ `practices-ui` Switched to `RewriteMissingTranslationHandler` (replacing `RewriteTranslateParser`) due to ngx-translate update. Config now uses rewriteResourceConfig with rewriteTypeConfig and optional missingKeyTransformFn.
- `practices-ui-ktbe` Adjust `PuibeSelectDirective` styles, so that the `ng-value-container` is not triggering a flex-wrap on the `PuibeTwoColumnComponent` layout.
- `practices-ui` Improve `toSignalLazy` by adding options and fixing bug regarding hidden signals.
- _BREAKING_ `practices-ui`, `practices-ui-clarity`, `practices-ui-ktbe`, `practices-ng-commands`, `practices-ng-common-util`, `practices-ng-dirty-guard`, `practices-ng-forms`, `practices-ng-list-view-source`, `practices-ng-logging`, `practices-ng-signals`, `practices-ng-status` Update Angular peer dependencies to support version 20. If you are below "@angular/cdk" 19.0.0, you might need to provide `DIALOG_SCROLL_STRATEGY_PROVIDER` yourself, because it got deprecated in newer versions.

### Fixed

- `practices-ui-ktbe` Fix `PuibeLabelDirective` mutation observer not getting the new text content in some cases.
- `practices-ui-ktbe` Fixed `PuibeBreadcrumbComponent` to also show route items, when they have the breadcrumb title set only via TitleService.
- `practices-ui-ktbe` Fixed `PuibeCheckboxComponent` touched not resetting.
- `practices-ui-ktbe` Fixed `PuibeTeaserComponent` not using its full height.
- `practices-ui-ktbe` Fixed `PuibeSelectableDirective` not working on tables.
- `practices-ui-ktbe` Fixed `PuibeHideIfEmptyTextDirective` not showing with nested directives and entrance animations.
- `practices-ng-forms` Fixed `provideWrappedFormControlAccessors` initial form value for `getValueAccessorEntityDtoSignal`.
- `practices-ui-ktbe` Fixed `PuibeSkipLink` not working with ids when hash navigation is active.
