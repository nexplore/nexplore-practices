# Changelog

All notable changes to this library will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Fixed

- [Practices.Ui.KtBe] Fix `PuibeLabelDirective` mutation observer not getting the new text content in some cases.
- [Practices.Ui.KtBe] Fixed `PuibeBreadcrumbComponent` to also show route items, when they have the breadcrumb title set only via TitleService.
- [Practices.Ui.KtBe] Fixed `PuibeCheckboxComponent` touched not resetting.
- [Practices.Ui.KtBe] Fixed `PuibeTeaserComponent` not using its full height.
- [Practices.Ui.KtBe] Fixed `PuibeSelectableDirective` not working on tables.

## [10.0.2](https://tfs.nexplore.ch/Nexplore/Framework/_git/Practices?version=GT10.0.2) - 2024-11-22

### Added

- [Practices.Ui.KtBe] Add a arrow tip to the flyout created with `PuibeFlyoutService`, with option `showArrowTips`.
- [Practices.Ui.KtBe] Add `PuibeGlobalDirtyGuardDirective` input `dirtyGuardHandler` which allows to override the behavior of the dirty guard dialog.
- [Practices.Ui.KtBe] Add `PuibeNestedDirtyGuardDirective` for nested router-outlets.
- [Practices.Ui.KtBe] Add `PuibeExpansionPanelComponent` new input value for `variant`: `red`.
- [Practices.Ui.KtBe] Add `PuibeHideIfEmptyTextDirective` and add it to the content of `PuibeActionDialogComponent`.
- [Practices.Ui.KtBe] Add `PuibeModalComponent` input `hideDoubleDividerLine`.
- [Practices.Ui.KtBe] Add form dialog example to action dialog storybook.
- [Practices.Web] Add support of `ProblemDetails` in `ExceptionFilterAttribute`.
- [Practices.Web] Add error handlers as implementations of `IExceptionHandler`.
- [Practices.Ui.KtBe] Add `PuibeToastComponent` input `hideScreenReaderHint`, with hint now being always displayed, not only when `showAlertIcon` ist true.

### Changed

- [Practices.Configuration] Updated package `Microsoft.Extensions.Configuration.Json` to version `8.0.1` due to vulnerabilities
- [Practices.EntityFramework] Updated packages `Microsoft.AspNetCore.DataProtection.EntityFrameworkCore`, `Microsoft.EntityFrameworkCore.Proxies`, `Microsoft.EntityFrameworkCore.SqlServer` to version `8.0.11` due to vulnerabilities
- [Practices.Mail] Updated package `MailKit` to version `4.8.0` due to vulnerabilities
- [Practices.Serilog] Updated package `Serilog.Settings.Configuration` to version `8.0.4` due to vulnerabilities

### Fixed

- [Practices.Ui.KtBe] Fix `PuibeCheckboxComponent` not properly updating status when underlying `formControl` changes.
- [Practices.Ui.KtBe] Fix `TableViewSource` to properly configure default orderings.
- [Practices.Ui.KtBe] Fix `PuibeTablePaginationComponent` not reflecting programmatic changes made on the view source.
- [Practices.Ui.KtBe] Fix `PuibeGlobalDirtyGuardDirective` null error and injection error.
- [Practices.Ui.KtBe] Fix `PuibeButtonDirective` to add a default `type="button"` when not set.
- [Practices.Ui.KtBe] Fix `PuibeExpansionPanelComponent` focus and hover styling for `variant`: `white`
- [Practices.Ui.KtBe] Fix `PuibeTableCellComponent` border style for the last row.
- [Practices.Ui.KtBe] Remove duplicate `dirty-guard.directive.ts`.
- [Practices.Ui.KtBe] Fix imports for action dialog component and storybook.
- [Practices.Ui.KtBe] Fix `PuibeTablePaginationComponent` bug with syncing page size.
- [Practices.Ui] Fix `compareObjShallow` custom comparator function to behave as expected.
- [Practices.Ui.KtBe] Fix `PuibeTableColumnComponent` issue with ng-content not working properly.

## [10.0.1](https://tfs.nexplore.ch/Nexplore/Framework/_git/Practices?version=GT10.0.1) - 2024-10-22

### Added

- [Practices.Ui.KtBe] Add `subtitle` to `PuibeActionDialogService`, add support for templates for `title`.
- [Practices.Ui.KtBe] Add `hideCloseButton` to `PuibeActionDialogService`.
- [Practices.Ui.KtBe] Add `PuibeInputDirective` selector `puibeInputGeneric` to allow any custom element.
- [Practices.Ui.KtBe] Add `PuibeFormField` ng-content `slot="readonly-prefix"` and `slot="readonly-postfix"` to add content to the readonly value.
- [Practices.Ui.KtBe] Add `PuibeFormField` ng-content `slot="below-input"` to add content before validation.
- [Practices.Ui.KtBe] Change `TableViewSource` constructor/columns input to allow partial columns configuration.
- [Practices.EntityFramework] Allow schema-relevant validation for `MaxLengthAttribute` and introduce new resource name for `Validation_MaxLength`.
- [Practices.Ui.KtBe] Add content slots for `PuibeTeaser` title and subtitle.
- [Practices.Ui.KtBe] Add `PuibeShellComponent` input `autofocusContentOnRouterNavigationConfig` to enable customization of the autofocus behavior.
- [Practices.Syncfusion.Excel] Add functionality to export a set of entries as a customizable excel using the Syncfusion library.
- [Practices.Ui.KtBe] Add `PuibeRadioButtonGroupComponent` margin between the field and the status icons

### Changed

- _BREAKING_ [Practices.Ui.Clarity] Updated all components to standalone components, therefor the oldest supported angular version is now version 15.
- [Practices.Ui.KtBe] Change `PuibeTableRowActionDirective` selector to allow any element, not just buttons, so custom components can be used.
- [Practices.Ui.KtBe] Improve `PuibeButtonArrowsComponent` style when button is more wide, fixes duplicate arrows by fading out icons.
- _BREAKING_ [Practices.Ui.KtBe] Remove `PracticesKtbeListComponentsModule` which was deprecated, use `PracticesKtbeTableComponentsModule` instead.

### Fixed

- [Practices.Ui.Clarity] Fix `DatagridListViewSourceDirectivet` to resize datagrid correctly after row changes.
- [Practices.Ui.KtBe] Fix `PuibeStatusHubComponent` to not show success message when result was dialog close.
- [Practices.Ui.KtBe] Fix `IListResult` property `total` accepting `null`.
- [Practices.Ui.KtBe] Fix `PuibeMonthInputDirective` property `endOfMonth` not reflected with readonly value.
- [Practices.Ui] Fix `StatusHubService` silently swallow exceptions when occuring in successMessage function.
- [Practices.Ui] When `PuibeActionDialogService` dialog closes, only cancel commands that are busy.
- [Practices.Ui.KtBe] Fix `PuibeTableColumn` align not working with column label.
- [Practices.Ui.KtBe] Fix `PuibeClickCommandDirective` no longer working with input alias.
- [Practices.Ui.KtBe] Fix `PuibeTablePaginationInfiniteScrollComponent` prefetching and loading spinner behaviour.
- _BREAKING_ [Practices.EntityFramework] Change resources interpolation in `ValidationProvider` to use named parameters. This makes it possible to use the same `ValidationResourceNames` in the Frontend and the Backend.
- [Practices.Ui] Add compatibility for angular 18
- [Practices.Ui.KtBe] Fix `PuibeExpansionPanel` accessibility to not read the header twice.
- [Practices.Ui.KtBe] Fix `PuibeRadioButtonGroupComponent` host class to be `block` instead of `inline-block`
- [Practices.Ui.KtBe] Fix `PuibeMonthInputDirective` returning an invalid date when `endOfMonth` is true and the input is being cleared.
- [Practices.Ui.KtBe] Fix `getRoutesForUrl` util to return correct match in cases where multiple similar routes are defined
- [Practices.Ui.KtBe] Fix `normalizeUrlForComparision` util to always end with '/' slash.
- [Practices.EntityFramework] Fix copy-paste error in `ValidationProvider` (`minimumLength`)
- [Practices.Ui.KtBe] Fix `PuibeCheckboxGroupComponent` not recognizing child checkboxes if they were defined inside a projected `ng-container`
- [Practices.Ui.KtBe] Fix all internal circular dependencies.
- [Practices.Ui.KtBe] Fix `PuibeTableColumnTranslateDirective` not translating properly in certain cases
- [Practices.Ui.KtBe] Remove `PuibeCalendarComponent` html attribute `aria-keyshortcuts` as it displays duplicate information and thus confusing.

## [10.0.0](https://tfs.nexplore.ch/Nexplore/Framework/_git/Practices?version=GT10.0) - 2024-10-22

## [9.0.0](https://tfs.nexplore.ch/Nexplore/Framework/_git/Practices?version=GT9.0) - 2024-04-29

### Added

- [Practices.Ui.KtBe] Added ellipsis to `PuibeTableCellComponent` to be able to display long strings in table with the 3 dots '...' at the end and a tooltip.
- [Practices.Ui.KtBe] Added `PuibeSelectOptionComponent` to be able to display additional data on select options with consistent styling.
- [Practices.Ui.KtBe] Added `PuibeIconValidComponent` to be able to display a valid icon.
- [Practices.Ui.KtBe] Added valueFormatter to `PuibeInputDirectiv` to be able format the values of an form input field.
- [Practices.Ui.KtBe] Added new variants to `PuibeButtonComponent` to be able to display danger-primary, accept and accept-primary styling.
- [Practices.Core] Added `IAuditable` interface for entities that should be written to the audit log.
- [Practices.Web] Added `StringLocalizerWithFormat` to be able to resolve template strings (e.g. `Foo {{ bar }}`) in resource files.
- [Practices.Web] Added `StringLocalizerWithFallback` to be able to fallback a resource which is not available in one resource file.
- [Practices.EntityFramework] Added `IDbContextTransactionFactory` and `DbContextTransactionFactory` to allow custom behavior.
- _BREAKING_ [Practices.EntityFramework] Added `AuditHistoryProvider` to consolidate audit history in practices.
- [Practices.Ui] Add `TitleService` to manage page title and breadcrumb titles
- [Practices.Ui] Add `RewriteTranslateParser` to be able to override resource string types (e.g. `Practices.Validation_Required` to `MyResource.Validation_Required`)
- [Practices.Ui] Add `providePractices` to configure and provide injectables.
- [Practices.Ui.KtBe] Add various Components following Kanton Bern Styleguide.
- [Practices.Ui.KtBe] Add `PuibeTablePaginationInfiniteScrollComponent` to use infinite scrolling instead of pagination for tables
- [Practices.Ui.KtBe] Add `MarkControlService`, `FormConfig` and `PuibeFormDirective` to support displaying of validation errors only after user interaction.
- [Practices.Ui.KtBe] Add default modules for easy import of thematically related components
- [Practices.Ui.KtBe] Add optional `noItemsMessage` input to `PuibeTableComponent`
- [Practices.Ui.KtBe] Add `showOptionsMenu` input to `PuibeTableColActionsComponent`. If true displays buttons or links as a popup options-menu.
- [Practices.Ui.KtBe] Add `PuibeTableHoverEmphasisDirective` to highlight specified columns on hover.
- [Practices.Ui.KtBe] Add `hideOptional` input to `PuibeCheckboxGroupComponent` and `PuibeRadioButtonGroupComponent` to force-hide the 'optional' label
- [Practices.Ui.KtBe] Add `legendAsLabel` input to `PuibeCheckboxGroupComponent` and `PuibeRadioButtonGroupComponent` to display the legend like a form-field label
- [Practices.Ui.KtBe] Add `ngOnDestroy` hook for all `*-MenuItemDirective` to remove all markup from DOM
- [Practices.Ui.KtBe] Add auto scroll feature and `disableScrollIntoView` to `PuibeExpansionPanelComponent`
- [Practices.Ui.KtBe] Add `PuibeStickyClassDirective` and `stickyBreadcrumbs` to shell
- [Practices.Ui.KtBe] Add `PuibeIconEnumerationComponent` for displaying numbers like an icon
- [Practices.Ui.KtBe] Add `itemAfterTemplate` to `PuibeHeaderComponent`, allowing to add custom content after each menu item
- [Practices.Ui.KtBe] Improve `PuibeBreadcrumbsComponent` to accept custom route config
- [Practices.Ui.KtBe] Fix `PuibeSideNavigation` footer overlapping longer content
- [Practices.Ui.KtBe] Fix `PuibeTeaser` property `teaserLink` not working with relative routes
- [Practices.Ui.KtBe] Add `PuibeReadonlyDirective` to enable readonly styling for form elements.
- [Practices.Ui.KtBe] Add new size `large-round` to `PuibeButtonDirective` for round buttons.
- [Practices.Ui.KtBe] Add `PuibeFileInputDirective` for input type="file" form fields to apply the KtBe style
- [Practices.Ui.KtBe] Add `PuibeIconUploadComponent` for `PuibeFileInputDirective`
- [Practices.Ui.KtBe] Extended `PuibeShellService.openRouteInSideMenu` with options to specify the behavior how a route path will be opened in the side menu.
- [Practices.Ui.KtBe] Add `PuibeShellComponent.autofocusContentOnRouterNavigation` which allows to automaticly focus the first element in the content, whenever a navigation happens.
- [Practices.Ui.KtBe] Add `PuibeFooterLanguageMenuItemDirective` which is the footer equivalent of the `PuibeHeaderLanguageMenuItemDirective`.
- [Practices.Ui.KtBe] Add `PuibeSidenavFooter` which is the footer optimized for the side navigation (See also `sidemenuFooterTemplate`).
- [Practices.Ui.KtBe] Add Input `navigatable` and Output`(navigate)` to `PuibeTeaser` to allow for custom functions.
- [Practices.Ui.KtBe] Add `useSmallTextForReadonlyLabel` property to form fields and make it globally configurable via `PUIBE_THEME_CONFIG`.
- [Practices.Ui.KtBe] Add `PuibeTableCellDirective` to apply the KtBe style for a table cell.
- [Practices.Ui.KtBe] Add `PuibeFormReadonlyField` to display readonly form control values.
- [Practices.Ui.KtBe] Add `PuibeDateInputDirective` inputs `min` and `max` with validation
- [Practices.Ui.KtBe] Add `PuibeDateInputDirective` additional input `type` values for `month` and `year`, changing the input format.
- [Practices.Ui.KtBe] Add `PuibeDatePickerComponent` input `viewMode` and more, which displays a year or month selection view.
- [Practices.Ui.KtBe] Render `PuibeDatePickerComponent` calendar weeks and add option to disable with `hideWeekLabels`.
- [Practices.Ui.KtBe] Add `PuibeDateInputDirective` input `calendarInitialDate` to open the calendar with at an initial period.
- [Practices.Ui.KtBe] Add `PuibeGlobalDirtyGuardDirective` which prompts the user for any unsaved changes before leaving.
- [Practices.Ui.KtBe] Add `PuibeStatusHubComponent` to display status messages and progress spinner.
- [Practices.Ui] Add `Command` as a pattern for defining user actions.
- [Practices.Ui.KtBe] Add `PuibeClickCommandDirective`
- [Practices.Ui.KtBe] Update `StatusService` to support command and add more configuration options, like whether an action should be blocking the ui.
- [Practices.Ui.KtBe] All directives that accept `Command` or `ListViewSource` now automaticly register it in the `StatusService`. Duplicate registrations will be automaticly ignored.
- [Practices.Ui.KtBe] Add `PuibeActionDialogService` as a way to quickly display standart or configurable multiple choice prompts
- [Practices.Ui.KtBe] Add `PuibeFormDirective` output `formStateChange` to get updates on `dirty` and other state changes.
- [Practices.Ui] Added [MigrationGuides](Docs/Practices.Ui/MigrationGuides.md) documentation.
- [Practices.Ui.KtBe] Add `PuibeMonthInputDirective` input `endOfMonth` to specify that the date object should always be the last day of the respective month.
- [Practices.Ui.KtBe] Add `PuibeSkipLinkComponent` for adding screen-reader skip-links.
- [Practices.Ui.KtBe] Add `heading-after` slot to `PuibeExpansionPanelComponent` for displaying additional info after the heading.
- [Practices.Ui.KtBe] Add `arrow-before` slot to `PuibeExpansionPanelComponent` for displaying additional info before the arro icon of the header.
- [Practices.Ui.KtBe] Add `PuibeIconEditComponent` for having an edit icon.
- [Practices.Ui.KtBe] Add `position` input to `PuibeStatusHubComponent` to be able to customice where the status toasts should be displayed.
- [Practices.Ui.KtBe] Add `PuibeTableColumn` inputs `translate` and `translateParams`, as translate directive wouldn't work on this component.
- [Practices.Ui.KtBe] Add `clear` button to `PuibeFormFieldComponent` to be able to clear select with one button click.
- [Practices.Ui.KtBe] Add complex demo for custom action dialogs in sample project.
- [Practices.Ui.KtBe] Add `PuibeClickCommand` support for `PuibeTeaserComponent`.
- [Practices.Ui.KtBe] Add download icon.
- [Practices.Ui.KtBe] Add file icon.
- [Practices.Ui.KtBe] Add `readonlyEmptyValuePlaceholder` input to `PuibeCheckboxGroupComponent`, `PuibeRadioButtonGroupComponent` and `PuibeFormFieldComponent`
- [Practices.Ui.KtBe] Add autohide option to `StatusProgressOptions` to override the default behaviour of non autohiding errors and autohiding success messages.
- [Practices.Ui.KtBe] The `PuibeModalComponent` and `PuibeFlyoutComponent` now enforce the aria heading level, to improve accessibility.
- [Practices.Ui.KtBe] The `PuibeModalComponent` and `PuibeFlyoutComponent` now allow to override the css class on titles.
- [Practices.Ui.KtBe] Add `PuibeModalTitleComponent` and `PubieFlyoutTitleComponent`, work same as directives, but take away the decision which tag name to use (as h1, h2 etc. would anyway display the same style and role).
- [Practices.EntityFramework] Added overloads to `WithNewSqlTransaction` that take DatabaseOptions instead of DatabaseFacade (ConnectionString in DatabaseFacade has no password if 'persist security info' is false).

### Changed

- _BREAKING_ [Practices.*] Update to .NET 8.0.3 including all third party libraries (Major updates: Autofac from 7.1.0 to 8.0.0 and Autofac.Extensions.DependencyInjection from 8.0.0 to 9.0.0)
- [Practices.Mail] Major update of dependency MailKit from 3.4.1 to 4.4.0 with no breaking changes for our usage
- [Practices.Ui.KtBe] set autocomplete to 'off' on `select.directive` to prevent the autocomplete pop-up from overlapping with the select dropdown.
- [Practices.Ui.KtBe] Refactor `side-navigation.component` to allow empty side navigation.
- [Practices.Ui] Refactor `title.service` to fix custom breadcrumb titles.
- [Practices.Web] Renamed `RewriteTypeStringLocalizerFactory` to `PracticesStringLocalizerFactory`. It now implements fallback and formattion of resource values and is internal.
- _BREAKING_ [Practices.Web] Refactor `LocalizationOptions.RewriteResourceTypes` to enable strongly-typed configuration for resource rewrites including fallback.
- _BREAKING_ [Practices.Core] Change definition of `IChildScopeFactory<out TDepentend>` to `IChildScopeFactory<TDepentend>` - also for interfaces with multiple generic parameters.
- _BREAKING_ [Practices.Core] Change definition of `IUnitOfWorkFactory<out TDepentend>` to `IUnitOfWorkFactory<TDepentend>` - also for interfaces with multiple generic parameters.
- [Practices.Core] Add `IUnitOfWorkFactory<out TDepentend>.BeginWithSingleDbTransactionAsync(...)` method.
- [Practices.Core] Add `IUnitOfWorkWithSingleDbTransaction.CommitDbTransactionAsync(...)` method.
- [Nexplore.Practices.Web] Modified `DbTransactionalUnitOfWorkAttribute` to use async methods for begin and commit.
- [Nexplore.Practices.Web] Add constructor for `DbTransactionalUnitOfWorkAttribute` to support commit based on http response codes.
- [Nexplore.Practices.Web] Change `Middleware.UsePerRequestChildScope` to set request services.
- [Nexplore.Practices.Web] Change `Middleware.UsePerRequestUnitOfWork` to set request services.
- _BREAKING_ [Practices.EntityFramework] Rename `IContextOptionsProvider` to `IDbContextOptionsProvider`.
- _BREAKING_ [Practices.EntityFramework] Rename `ContextOptionsProvider` to `DbContextOptionsProvider`.
- _BREAKING_ [Practices.EntityFramework] Rename `IModelCreator` to `IDbModelCreator`.
- _BREAKING_ [Practices.EntityFramework] Rename `ModelCreator` to `DbModelCreator`.
- _BREAKING_ [Practices.EntityFramework] Change signature of `IDbContextFactory.Create`.
- _BREAKING_ [Practices.EntityFramework] Moved parts of database context setup from `IUnitOfWorkFactory` to `IDbContextFactory.Create`.
- [Practices.EntityFramework] Added flag `DetectChangesOnPrepareSaveChanges` to `DatabaseOptions`
- [Nexplore.Practices.Configuration] Added support for IOptionsMonitor<TOption> for registered options
- [Practices.Ui] Update Peer Dependencies to support Angular 16
- [Practices.Ui.KtBe] Unified all icon components to have common properties (`direction`, `size`), deprecated some inconsistent ones.
- [Practices.Ui.KtBe] Improved several components to allow for more customizability and content projection.
- [Practices.Ui] Update api of `ListViewSource` to allow infinite scrolling.
- [Practices.Ui] Move ngx-translate dependency up from _practices-ui-clarity_ to _practices-ui_.
- [Practices.Ui.KtBe] Add accessibility improvements to `PuibeDatePickerComponent`
- [Practices.Ui.KtBe] Change Button Alignment in `PuibeFlyoutComponent` and `PuibeModalComponent`
- [Practices.Ui.KtBe] Improved typing of `PuibeModalService` and `PuibeFlyoutService`.
- [Practices.Ui.KtBe] add starting value to `displayAsInvalid$` in `FormFieldService` and `RadioButtonGroupService`. This avoids flickering of Forms on initial loading.
- [Practices.Ui.KtBe] Improve `PuibeSideNavigationComponent` layout and expand behavior
- [Nexplore.Practices.Configuration] Added support for environment specific appsettings files to load
- [Practices.Ui.KtBe] Changed `PuibeDropdownButtonComponent` to take an `size` input equal to the size options on `PuibeButtonDirective`.
- [Practices.Ui.KtBe] Changed `PuibeDropdownButtonComponent` to accept inputs to control the positioning of the menu.
- [Practices.Ui.KtBe] Extended `PuibeDropdownButtonComponent` to allow for flexible icons within the content of each `DropdownMenuOption`.
- [Practices.Ui.KtBe] Improved `PuibeSideNavigationComponent` and `PuibeBreadcrumbComponent` mobile responsiveness and accessiblity.
- _BREAKING_ [Practices.Ui.KtBe] Refactored `PuibeSideNavigationComponent` to render footer only using `sidemenuFooterTemplate` property, settable also through `PuibeHeaderComponent`.
- _BREAKING_ [Practices.Ui.KtBe] Refactored `PuibeFooterMenuItemDirective` to no longer wrap itself with `li`, but rather set the attribute`role="listitem"`. Also added support for other elements than `a` tags. Normally it should not be breaking your code, but make sure to re-check everything looks good!
- [Practices.EntityFramework] Improve flexibility in `DbContextFactory` and `EntityFrameworkContext` to override methods within a custom project
- [Practices.Ui.KtBe] Extended `borderBottom` and `borderTop` inputs to `PuibeTableRowComponent` to customize the border in a table
- [Practices.Ui.KtBe] Extended `align` input to `PuibeTableCellComponent` and `PuibeTableColumnComponent` to customize the alignment of the text
- [Practices.Ui.KtBe] Add style `font-medium` to `PuibeTableCellComponent` when its used inside of `PuibeTableFooterComponent`
- [Practices.Ui.KtBe] Extended `PuibeTableFooterComponent` that it can also contain a `PuibeTableRowComponent`
- [Practices.Ui.KtBe] Improved `PuibeShellComponent.autofocusContentOnRouterNavigation` to support `<main>` elements with `[tabindex]` attribute (See example app component)
- [Practices.Ui.KtBe] Improved `FormFieldService` validation accessibility by conditionally setting `aria-live` to assertive ONLY when the field is being edited, not on initial page load.
- [Practices.Ui.KtBe] Improved language menu item accessibility.
- [Practices.EntityFramework] Improved flexibility in `DbContextFactory` and `EntityFrameworkContext` to override methods within a custom project.
- [Practices.Ui.KtBe] Extended `PuibeInputDirective` to allow having different label and placeholder.
- _BREAKING_ [Practices.Ui.KtBe] If using `FormFieldService.setIcon` method with `clickable: true`, make sure to subscribe to and handle `iconClick$`, as the newly rendered icon-button will no not delegate the click event to the input.
- [Practices.Ui.Clarity] Update peer dependencies, to allow clarity v16.
- [Samples] Update clarity to v16.
- [Practices.Ui.KtBe] Improved `PuibeSelectDirective` to show the search icon when is searchable and set a default focus placeholder
- _BREAKING_ [Practices.Ui.KtBe] Add Practices resource name `Labels_Select_SearchText` for `PuibeSelectDirective` default focus placeholder
- [Practices.Ui.KtBe] Refactor `PuibeDateInputDirective` calendar behavior to improve accessibility.
- _BREAKING_ [Practices.Ui.KtBe] Remove `PuibeDateInputDirective.disableCalendarAutoshow`, Now opens only via button/keyboard.
- _BREAKING_ [Practices.Ui.KtBe] Remove `PuibeDatePickerComponent` input properties `disableKeyboardNav` and `nonFocusable`, as they no longer have any purpose.
- _BREAKING_ [Practices.Ui.KtBe] Rename `PuibeDatePickerComponent` input property `disable` to `disabled`, to be consistent with standard html attributes.
- _BREAKING_ [Practices.Ui.KtBe] Added several Practices Resource Names for the date picker accessibility improvements.
- [Practices.Ui.KtBe] Change `PuibeDateInputDirective` to set `number` as form value when `type="year"`.
- _BREAKING_ [Practices.Ui.KtBe] Rename `PuibeDatePickerComponent` to `PuibeCalendarComponent`.
- _BREAKING_ [Practices.Ui.KtBe] Validation resource name `Validation_InvalidDatePattern` should now include a `{{format}}` placeholder.
- _BREAKING_ [Practices.Ui.KtBe] Extend `providePracticesKtbe` config and rename `formFieldServiceConfig` to more generic `forms`.
- _BREAKING_ [Practices.Ui.KtBe] Changed `PuibeSelectDirective` handling of items with null values, to allow for those to be initially selected.
- [Practices.Ui] Update angular to v16.2
- [Practices.Ui] Update peer depdendencies to support angular v17
- [Practices.Ui.KtBe] Improve `PuibeActionDialogService` by adding `createShowCommand` to reduce boilerplate and allow for more clear api.
- [Practices.Ui.KtBe] Improve `PUIBE_DIALOG_PRESETS.DELETE` template to use status category `action-delete`.
- [Practices.Ui.KtBe] The `PuibeActionDialogService` actions now take the passed in dialog data as arguments.
- [Practices.Ui.KtBe] Improve `MigrationGuides.md` documentation on the action-dialog api.
- _BREAKING_ [Practices.Ui.KtBe] Rename `PUIBE_DIALOG_PRESETS` preset `confirmUnsavedChanges` to `confirmDiscardUnsavedChanges`.
- [Practices.Ui.KtBe] Allow to pass a getter function for the config of `PuibeActionDialogService.createShowCommand`
- [Practices.Ui.KtBe] Added label text to aria-label of `PuibeSelectDirective` so that the screen reader reads the label of the input as well as the selected value.
- [Practices.Ui.KtBe] Add `statusOptions` to `PuibeTableComponent` and `PuibeSelectViewSourceDirective`, to allow overriding the default behavior.
- [Practices.Ui.KtBe] The `PuibeSelectViewSourceDirective` now does no longer show the global status loading message by default.
- [Practices.Ui.KtBe] Improved `Command` passing custom `before`- and `afterExecuteHandler` through multiple wrappers, added tests.
- [Practices.Ui.KtBe] Improved `StatusService.registerCommand` potentially leaking subscriptions when not used with `clickCommand` directive, added tests.
- _BREAKING_ [Practices.Ui] Renamed `Command` option `canExecute` to `canExecute$`.
- [Practices.Ui.KtBe] Added method `StatusHubComponent` input `statusHubConfig` to allow override default config and specify the comparator function for events.
- [Practices.Ui.KtBe] Improved `ActionDialogService` to check for action command options and smartly toggle busy spinner.
- [Practices.Ui.KtBe] Added options action button `variant` and `contentInputs` to config in `ActionDialogService`, to allow for more flexibility.
- [Practices.Ui.KtBe] Added `PuibeCheckboxComponent` content slot so a custom label can be displayed.
- [Practices.Ui.KtBe] Added `PuibeCheckboxComponent` input `alignLabelStart` to vertically align label at start.
- [Practices.Ui.KtBe] Add logging for errors emitted to `SatusHubService`, disable it with config `disableLogErrorsToConsole`.
- [Practices.Ui.KtBe] Add option `busyAsSilentByDefault` to `SatusHubService`, to allow hiding default progress spinner.
- [Practices.Ui.KtBe] Deprecated `PracticesKtbeListComponentsModule` in favor of `PracticesKtbeTableComponentsModule`.
- _BREAKING_ [Practices.Ui.KtBe] Added several Practices Resource Names for the table accessibility improvements.
- _BREAKING_ [Practices.Ui.KtBe] Add fallback text default for `noItemsMessage` on `PuibeTableComponent`, if you didn't use the property before and showed a message using your own markup, the message might get displayed twice.
- [Practices.Ui.KtBe] Change `PuibeTableColumnComponent` default vertical align to bottom.
- [Practices.Ui.KtBe] Changed readonly value in `FormFieldService` for file inputs.
- _BREAKING_ [Practices.EntityFramework] Added parameter `includeOwnedReferences` in `EntityChangeTrackingService` methods to include changes of owned references.
- [Practices.Ui.KtBe] Changed `PuibeGlobalRouteGuardService` to allow for a global check-discard method for special use cases.
- _BREAKING_ [Practices.Ui.KtBe] Added margin top to `PuibeRadioButtonGroupComponent` and `PuibeCheckboxGroupComponent` for consistency reasons.
- [Practices.Ui.KtBe] Override getQueryParams() and getQueryParams$() in `TableViewSource` to add column ordering to queryParams.
- [Practices.Ui.KtBe] Adjust loading spinner behaviour of `PuibeFormFieldComponent` to display the loading spinner also when the FormControl is invalid.
- [Practices.Ui.KtBe] Refactor `PuibeInpageSearchComponent` so that the component can be used in both template driven and reactive forms.
- _BREAKING_ [Practices.EntityFramework] `EntityChangeTrackingService` methods `GetChangedProperties` and `GetChanges` only return changes if entry.State == EntityState.Modified
- [Practices.Ui.KtBe] Fix styling of `PuibeActionToast` - use the same styling and animation as in `PuibeHeaderServiceMenuItem` to create consistent look & feel.
- _BREAKING_ [Practices.EntityFramework] `IEntityChangeTrackingService` require passing the acutal `EntityType`, not just `IEntityType<TKey>`.
- [Practices.Ui.KtBe] Improve `PuibeFlyoutService` and `PuibeModalService` accessibility by focusing the whole dialog element instead of the form-elements within.

### Fixed

- [Practices.Ui.KtBe] Refactor `file-input.directive` to trigger mark as touched after uploadoverlay is closed.
- [Practices.Ui.KtBe] Refactor `input.directive` to not trigger mark as touched after blur, to prevent display validation when opening uploadoverlay.
- [Practices.Ui.KtBe] Refactor `file-input.directive` to allow twice the same upload after setting the value with writeValue.
- [Practices.Ui.KtBe] Refactor `date-input.directive` to only support Dates and not strings.
- [Practices.Ui.KtBe] Refactor `table-pagination-infinite-scroll.component` to fix infinite scrolling on table.
- [Practices.File] Initialize options with default value to avoid `NullReferenceException`.
- [Practices.Ui] Fix late subscription bug on `TitleService`
- [Practices.Ui.KtBe] Fix `ListViewSource` endless busy spinner bug.
- [Practices.Ui.KtBe] Fix minor issue with `getRoutesForUrl` when a route path contained mutltiple slashes.
- [Practices.Ui.KtBe] Fix issue with `PuibeSideNavigationComponent` not always displaying navigation item links properly.
- [Practices.Ui.KtBe] Fix `puibeAddTitleIfEllipsis` using innerHTML instead of innerText.
- [Practices.Ui.KtBe] Fix readonly display of `PuibeSelectDirective` for when using async select-view-sources, and general handling of readonly values of async sources in `FormFieldService`.
- [Practices.Ui.KtBe] Fix accessibility of `PuibeSelectDirective` by reading out currently selected value.
- [Practices.Ui.KtBe] Improve styling of `PuibeInputDirective` for invalid `textareas` with scrollbars, introduced new `scrollbar-thin` style.
- [Practices.Ui.KtBe] Fix `PuibeHeaderLogoComponent` click on link not closing sidenav, introduce `clickLink` event.
- [Practices.Ui.KtBe] Fix `PuibeDateInputDirective` issues when the calendar popup would not open with the keyboard entered date.
- [Practices.Ui.KtBe] Fix `PuibeCalendar` issue with `min`/`max` dates in `month` mode.
- [Practices.Ui.KtBe] Fix `PuibeFormFieldComponent` issue for Firefox, the date-picker icon size being to big.
- [Practices.Ui.KtBe] Fix `PuibeStatusHub` issue showing success message when a action dialog was cancelled.
- [Practices.Ui.KtBe] Fix `Command` typing issue that would represent wrong result types at compile time.
- [Practices.Ui.KtBe] Fix `StatusHubService` register returning null instead of subscription, when operation was registered multiple times.
- [Practices.Ui.KtBe] Fix `PuibeCalendar` issue when navigating to today, that the year view would always move back to the current date.
- [Practices.Ui.KtBe] Fix `PuibeFormFieldComponent` issue that caused the date icon to flicker on opening the page.
- [Practices.Ui.KtBe] Fix styling issue with table inline col actions not properly rendered, as `PuibeTableCellComponent` hat a style setting max-width to `0`.
- [Practices.Ui.KtBe] Improve accessibility of `PuibeTableColumnComponent` by making sortable columns a button and describing the status, also added resource names.
- [Practices.Ui.KtBe] Fix `Command` error not displaying in status service, when `beforeExecuteHandler` throws.
- [Practices.Ui.KtBe] Fix `PuibeStatusHubComponent` loading spinner z-index to overlay above dialog.
- [Practices.Ui.KtBe] Fix `PuibeExpansionPanel` not properly collapsing to zero height.
- [Practices.Ui.KtBe] Fix `PuibeDateInputDirective`/`PuibeCalendarComponent` issues with the today button not behaving correctly.
- [Practices.Ui.KtBe] Fix `PuibeFileInputDirective` not emitting markAsTouched if icon button was used for uploading the file.
- _BREAKING_ [Practices.Ui.KtBe] Fix `PuibeTablePaginationInfiniteScrollComponent` prefetching behaviour. Prefetching of data for infinite scrolling can no longer be called via the `page` function. Use `prefetchNextPage` instead.
- [Practices.Ui.KtBe] Fix `PuibeTableColumn` not placing header text correctly based on align input.

### Removed

- _BREAKING_ [Practices.Core] Remove `PracticesConstants.Scopes.REQUEST_SCOPE_KEY` constant
- _BREAKING_ [Nexplore.Practices.Web] Remove `HttpContextExtensions`
- _BREAKING_ [Nexplore.Practices.Web] Remove `PracticesControllerActivator`

## [8.0.0](https://tfs.nexplore.ch/Nexplore/Framework/_git/Practices?version=GT8.0) - 2023-03-09

### Added

- [Practices.Core] Introduce `IChildScope` as an abstraction to begin child scopes (similar to unit of work within a database context)
- [Practices.EntityFramework] Add `ConfigureConventions` method in `IModelCreator` to configure global conventions
- [Practices.EntityFramework] Add method to remove `Base` suffix from entity table names
- [Practices.EntityFramework] Make public methods of `EntityMetadataProvider` virtual so it can be overriden
- [Practices.EntityFramework] Make `PrepareSaveChanges` of `EntityFrameworkContext` virtual so it can be overriden
- [Practices.EntityFramework] Allow `ApplyIncludes` to include properties with old EF6 lambda syntax, e.g. `e => e.Collection.Select(c => c.Property)`
- [Practices.Web] Allow delete in `ISessionDataProvider`

### Changed

- _BREAKING_ [Practices.Core] Update to .NET 7 including all third party libraries
- _BREAKING_ [Practices.Core] Change AES encryption key to use SHA265 instead of SHA1
- _BREAKING_ [Practices.Core] Update namespaces for `IUnitOfWork` and `IUnitOfWorkFactory` and rename unit of work constants
- _BREAKING_ [Practices.EntityFramework] Refactor methods in `ModelCreator` to have more extension points and more flexibility
- _BREAKING_ [Practices.EntityFramework] Refactor database migration and data seeding (using generators) to have asynchronous methods only
- _BREAKING_ [Practices.EntityFramework] `AutoDetectChangesEnabled` for ef change tracking is now configurable and `true` by default (was `false` before).
- [Practices.Web] Rename `UnitOfWorkControllerActivator` to `PracticesControllerActivator`
- _BREAKING_ [Practices.Web] Rename middleware `UsePerRequestUnitOfWork()` to `UsePerRequestScope()`
- [Practices.Ui] Update Peer Dependencies to support Angular 15
- _BREAKING_ [Practices.Ui.Clarity] Update DatePicker to use typed forms
- [Practices.Ui.Clarity] Update Peer Dependencies to support Angular 15 and Clarity 15
- [Practices.Ui.Samples] Update to Angular 15 and Clarity 15
- [Practices.Ui.Samples] Update DatePicker example to use typed forms
- _BREAKING_ [Practices.Web] Require not null for argument `value` in method `Save` in `CookieSessionDataProvider`

### Fixed

- [Practices.Core] Make `expirationDate` in `ISessionDataProvider` optional
- [Practices.Core] Add matching lifetime scope fallback to root scope if `IUserInfoResolver` is resolved outside of unit of work
- [Practices.Web] Fix `NullReferenceException` in `UnitOfWorkControllerActivator` if there is no unit of work configured
- [Practices.Web] Fix `DefaultCookiePath` in `CookieService`, encoding not necessary, / at end only for empty path. https://www.rfc-editor.org/rfc/rfc6265#section-5.2.4
- [Practices.Web] `CookieService` uses cookie options to call `Response.Cookies.Delete` to use the correct cookie path when we don't run in root (/)

### Removed

- _BREAKING_ [Practices.EntityFramework] Remove deprecated `ApplyTableName` method

## [7.0.0](https://tfs.nexplore.ch/Nexplore/Framework/_git/Practices?version=GT7.0) - 2022-01-12

### Added

- [Practices.EntityFramework] Add `CreateAndAdd` method in `ICreateDeleteRepository`
- [Practices.EntityFramework] Add `DbTimeoutService` to set custom db command timeouts
- [Practices.EntityFramework] Add configuration to set command timeout for database migrations
- [Practices.EntityFramework] Add overload methods for all `GetBy*()` methods to bypass the local db set cache

### Changed

- [Build] Update Build Scripts to Practices.Build and move from TeamCity to Azure DevOps pipelines
- _BREAKING_ [Practices.Core] Update to .NET 6 including all third party libraries
- _BREAKING_ [Practices.Core] Removed `EnumerableExtensions.DistinctBy()` as this is now integrated into .NET 6
- [Practices.Core] Extended GetById to allow passing includes as string
- _BREAKING_ [Practices.EntityFramework] Streamlined naming of GetBy-methods.
- _BREAKING_ [Practices.Web] Use `IServiceProvider` instead of Autofac `IContainer` for application middlewares
- [Practices.Ui] Update Peer Dependencies to support Angular 13
- [Practices.Ui] Changed tslint to eslint
- [Practices.Ui.Clarity] Update Peer Dependencies to support Angular 13 and ngx-translate 14
- [Practices.Ui.Samples] Update to Angular 13 and Clarity 5.6

### Fixed

- [Practices.Core] User impersonation is now retained over multiple nested units of work
- [Practices.Web] Updated SetFileDownloadHeader to use `FileNameStar` property and encode the FileName for the `FileName` property.

## [6.1.0](https://tfs.nexplore.ch/Nexplore/Framework/_git/Practices?version=GT6.1) - 2021-12-10

### Added

- [Practices.Ui] Add option to specify a placeholder for date picker input field

## [6.0.0](https://tfs.nexplore.ch/Nexplore/Framework/_git/Practices?version=GT6.0) - 2021-03-11

### Added

- [Practices.Core] Validation helper to validate an email address
- [Practices.EntityFramework] Change Tracking service to get changed entities during validation
- [Practices.EntityFramework] Optionally clean up complete database before applying migrations (e.g. for feature branch deployments)
- [Practices.EntityFramework] Various extension methods for the `DatabaseFacade`
- [Practices.EntityFramework] Add methods for detecting property changes
- [Practices.File] Add infrastructure for file handling with mime type mappings and streaming utilities
- [Practices.Mail] Add infrastructure to send emails via SMTP and optionally store a copy of them on the file system
- [Practices.Web] Enhance error dto with a correlation id and optional exception info (configured with `Api.IncludeFullExceptionDetails`)
- [Practices.Web] Json Converter for `DateTime`
- [Practices.Web] Input Formatter for correct `Stream` handling in the request body
- [Practices.Web] Add service to set reponse headers for file downlods
- [Practices.Ui] `DestroyService` for better subscription handling

### Changed

- _BREAKING_ [Practices.Core] Update to .NET 5
- _BREAKING_ [Practices.Core] Update Autofaq
- _BREAKING_ [Practices.Web] Refactor cookie handling and session data provider to retrieve a generic value
- [Practices.Web] Replace `Newtonsoft.Json` with `System.Text.Json`
- [Practices.Ui] Update to Angular 11 and Clarity 4
- [Practices.Ui] Refactor dialog service for displaying dynamic number of buttons
- _BREAKING_ [Practices.Ui] `DialogService.confirmAsync` now allows the `confirmAsyncHandler` to return a result, which will be passed to the returning observable. Previously it would only return `false`, when the dialog was cancelled, or true if the handler did not explicitly return `false` or `null`.
  Now when the user confirms the dialog, it will normally return the result of the handler, unless the handler did not return any value(`undefined`), in which case it will emit `true` (same like before).
- [Practices.Ui.Clarity] Update Peer Dependencies to support Clarity 5 and ngx-translate 13

### Fixed

- Exclude types that are mapped to views from table name convention

## [5.0.0](https://tfs.nexplore.ch/Nexplore/Framework/_git/Practices?version=GT5.0) - 2020-07-24

### Added

- Initial backend release based on .NET Core 3.1
- Initial ui release based Angular 9 and Clarity 3
