# Changelog

All notable changes to this library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added

- [Practices.Ui] Added `provideWrappedFormControlAccessors` ability to override `setDisabledState`.
- [Practices.Ui] Added support for filtering status events via a configurable `filter` property in `StatusHubConfig` (ignored by default: AbortError DOMExceptions).

### Changed

### Fixed

- [Practices.Ui.*] Fixed `command.fromInput` to properly handle legacy commands when `mapArguments` is configured.
- [Practices.Ui.Ktbe] Fixed `PuibeCheckboxComponent` touched initial value not emitting.
- [Practices.Ui.Ktbe] Fixed `PuibeReadonlyLabelValueComponent` styling, to break long words when they are overflowing.
- [Practices.Ui.*] Fixed `Command.cancel()` to abort even when the handler was returning a promise instead of an observable.
- [Practices.Ui.*] Fixed `command.query.withSignalTrigger()` typing to reflect null/undefined args behavior.
- [Practices.Ui.*] Fixed table view source column `sortDir` not synchronizing with persisted ordering parameters.

## [11.0.0](https://github.com/nexplore/nexplore-practices/releases/tag/11.0.0) - 2025-11-06

> New major version due to open-sourcing of the project.

### Added

- [Practices.Ui.KtBe] Add `PuibeTableRowActionTriggerDirective` input `puibeTableRowActionTriggerDisabled` to disable the trigger.
- [Practices.Ui.KtBe] Add `shouldShowOptionalFlagFn` to form config, adding the ability to override the default condition for when the "conditional" label should be rendered.
- [Practices.Ui.KtBe] Add `PuibeBreadcrumbComponent` input `hideCurrentlyActiveItem` for further customization.
- [Practices.*] Add support for .NET 9 and .NET 8 by switching to multi-targeting.
- [Practices.Syncfusion.Pdf] Add functionality to facilitate generating pdf files using the Syncfusion library.
- [Practices.Syncfusion.Excel] Add context away column value converters.
- [Practices.Ui.KtBe] Add `PuibeExpansionPanelComponent` input `compact` for smaller accordions and new color `variant` 'light-sand'.
- [Practices.Ui.KtBe] Add `PuibeSideOverlayPanelService` to display additional information on the right side of the screen, hidden in a drawer like side panel.
- [Practices.Ui.KtBe] Add `PuibeTimelineItemComponent` that can be used to display a history or process-visualization.
- [Practices.Ng.Forms] Added a new config to disable validation on readonly form fields.

### Changed

- [Practices.Ui.Clarity] Add support for angular 19
- _BREAKING_ [Practices.Ui.*] Set minimum supported angular version to v18, Updated all libs and demo apps.
- Migrated Angular related projects to Nx workspace.
- _BREAKING_ [Practices.*] Update third party libraries (Major updates: Autofac from 8.0.0 to 8.3.0 and Autofac.Extensions.DependencyInjection from 9.0.0 to 10.0.0)
- [Practices.*] Updated .NET Libraries from 9.0.3 to 9.0.7
- [Practices.Practices.Mail] Updated MailKit from 4.11.0 to 4.13.0
- [Practices.Syncfusion.Excel] Updated Syncfusion libs to version 30.1.42.
- [Practices.Syncfusion.Pdf] Updated Syncfusion libs to version 30.1.42, SixLabors.ImageSharp from 3.1.8 to 3.1.11
- [Practices.Tests] Updated Testcontainers.MsSql from 4.4.0 to 4.6.0
- [Practices.Syncfusion.Excel] Include Headers in Excel exports of empty datasources.
- _BREAKING_ [Practices.Syncfusion.Excel] Add `IAsyncEnumerable` as datasource and changed datasource `IEnumerable` to an asynchronous implementation.
- [Practices.Core] Add support for convert expressions in property paths.
- [Practices.Ui.KtBe] Deprecate `PuibeClickCommandDirective` in favor of `PuiClickCommandDirective` from `@nexplore/practices-ng-commands`.
- [Practices.Ui.KtBe] Refactor `PuibeActionDialogService` to accept `PuiClickCommandDirective` from `@nexplore/practices-ng-commands`.
- [Practices.Ui.KtBe] Refactor `PuibeButtonDirective` and `PuibeTeaserComponent` to host `PuibeMigratingClickCommandHostDirective`, accepting both legacy and modern commands from `@nexplore/practices-ng-commands`.
- _BREAKING_ [Practices.Ui] Remove `CommandTriggerOptions`, `CommandAfterExecuteResult`, `CommandAsyncHandlerResult`, `CommandAsyncHandlerFn`, `CommandAsyncHandlerArg`, to avoid duplicate definitions with `@nexplore/practices-ng-commands`.
- _BREAKING_ [Practices.Ui] Renamed `CommandOptions`, `CommandTriggerOptions` to `LegacyCommandOptions`, `LegacyCommandTriggerOptions` to avoid confusion with `@nexplore/practices-ng-commands`.
- _BREAKING_ [Practices.Ui.KtBe] Re-export form field directives and service from `@nexplore/practices-ng-forms`, `[puibeForm]` must now be declared on a element with a `[formGroup]`, instead of any `form` tag.
- [Practices.Ui.KtBe] Refactor all Form based components to use the new directives and services from `@nexplore/practices-ng-forms` underneath.
- [Practices.Ui.KtBe] Refactor `PuibeGlobalDirtyGuardDirective` and all related code to use implementation from `@nexplore/practices-ng-dirty-guard`.
- _BREAKING_ [Practices.Ui.KtBe] Removed `PuibeGlobalDirtyGuardDirective` output `dirtyGuardEvents`.
- _BREAKING_ [Practices.Ui.KtBe] In order for the dirty guard to work, `providePracticesKtbe()` has to be added to the application providers, as it configures the dirty guard to use the proper action dialog user interface.
- [Practices.Ui.KtBe] Re-export all list/table/select-view-source related classes from `@nexplore/practices-ng-list-view-source`.
- [Practices.Ui] Deprecate `createListViewSource()`, use new `tableViewSource` factory extensions from `@nexplore/practices-ng-list-view-source`.
- [Practices.Ui.*] Introduce new factory extensions for `tableViewSource`, `selectViewSource`, `command` and `formGroup` from `@nexplore/practices-ng-list-view-source`, `@nexplore/practices-ng-commands` and `@nexplore/practices-ng-forms`.
- _BREAKING_ [Practices.Ui.KtBe] Updated date-fns to use minimum v4
- _BREAKING_ [Practices.Ui.KtBe] Updated `PuibeActionDialogService` to use `Command` from `@nexplore/practices-ng-commands` and no longer accepts `LegacyCommand`, also `createShowCommand` now returns new command with sligthly different api (eg. trigger now returns `void` instead of `boolean`)
- _BREAKING_ [Practices.Ui.KtBe] Updated `FormFieldService` method `emitIconClick` to require an `MouseEvent` instance.
- [Practices.Ui.KtBe] Update peer dependency for "@ng-select/ng-select" to support version range >=13.0.0 <15.0.0
- [Practices.Ui.KtBe] Update peer dependency for "@ngx-translate/core" to support version range >=15.0.0 <17.0.0
- _BREAKING_ [Practices.*] Add `CancellationToken` and use `ConfigureAwait(false)` for async operations.
- _BREAKING_ [Nexplore.Practices.EntityFramework] Align signature of `Apply` and `ApplyWithMap` in `AsyncQueryParamsApplier` and `SyncQueryParamsApplier` to naming conventions.
- _BREAKING_ [Practices.Ui] Switched to `RewriteMissingTranslationHandler` (replacing `RewriteTranslateParser`) due to ngx-translate update. Config now uses rewriteResourceConfig with rewriteTypeConfig and optional missingKeyTransformFn.
- [Practices.Ui.KtBe] Adjust `PuibeSelectDirective` styles, so that the `ng-value-container` is not triggering a flex-wrap on the `PuibeTwoColumnComponent` layout.
- [Practices.Ui] Improve `toSignalLazy` by adding options and fixing bug regarding hidden signals.
- _BREAKING_ [Practices.Ui.*] Update Angular peer dependencies to support version 20. If you are below "@angular/cdk" 19.0.0, you might need to provide `DIALOG_SCROLL_STRATEGY_PROVIDER` yourself, because it got deprecated in newer versions.

### Fixed

- [Practices.Ui.KtBe] Fix `PuibeLabelDirective` mutation observer not getting the new text content in some cases.
- [Practices.Ui.KtBe] Fixed `PuibeBreadcrumbComponent` to also show route items, when they have the breadcrumb title set only via TitleService.
- [Practices.Ui.KtBe] Fixed `PuibeCheckboxComponent` touched not resetting.
- [Practices.Ui.KtBe] Fixed `PuibeTeaserComponent` not using its full height.
- [Practices.Ui.KtBe] Fixed `PuibeSelectableDirective` not working on tables.
- [Practices.Ui.KtBe] Fixed `PuibeHideIfEmptyTextDirective` not showing with nested directives and entrance animations.
- [Practices.Ui] Fixed `provideWrappedFormControlAccessors` initial form value for `getValueAccessorEntityDtoSignal`.
- [Practices.Ui.KtBe] Fixed `PuibeSkipLink` not working with ids when hash navigation is active.
