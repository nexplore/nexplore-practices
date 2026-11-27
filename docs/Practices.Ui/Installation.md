# Introduction

Practices.Ui provides Angular libraries for frontend development. You can choose from the following libraries:

- [practices-ui-clarity](../../ng/practices-ui-clarity/README.md): Extensions for Clarity component library
- [practices-ui-ktbe](../../ng/practices-ui-ktbe/README.md): Component library following the [Kanton Bern Styleguide](https://kantonbern.snowflake.ch/styleguides/1/Kanton-Bern/)
- [practices-ui](../../ng/practices-ui/README.md): Agnostic services and helpers for Angular (**Legacy**)
- [practices-ng-commands](../../ng/practices-ng-commands/README.md): Command utilities for Angular
- [practices-ng-common-util](../../ng/practices-ng-common-util/README.md): Common utilities for Angular applications
- [practices-ng-dirty-guard](../../ng/practices-ng-dirty-guard/README.md): Dirty guard for Angular forms
- [practices-ng-forms](../../ng/practices-ng-forms/README.md): Enhanced forms for Angular
- [practices-ng-list-view-source](../../ng/practices-ng-list-view-source/README.md): List view source utilities
- [practices-ng-logging](../../ng/practices-ng-logging/README.md): Logging utilities for Angular
- [practices-ng-signals](../../ng/practices-ng-signals/README.md): Signal management for Angular
- [practices-ng-status](../../ng/practices-ng-status/README.md): Status management for Angular

The sample projects demonstrate the usage of these libraries.

# Installation

How to install these libraries in your projects

## practices-ui

- Make sure your project has the peer dependencies in `projects/practices-ui/package.json` installed
- `npm install --save @nexplore/practices-ui`
- Add `providePractices({...})` to the providers array in your main.ts

## practices-ui-clarity

- Make sure your project has the peer dependencies in `projects/practices-ui-clarity/package.json` installed
- Make sure to follow the official [Clarity Installation Guide](https://clarity.design/documentation/get-started) to install Clarity in your project
- `npm install --save @nexplore/practices-ui-clarity`

## practices-ui-ktbe

- practices-ui-ktbe is based on Tailwind CSS 4, which is installed through PostCSS (see the official [Tailwind CSS guide for Angular](https://tailwindcss.com/docs/installation/framework-guides/angular)):
  - `npm install --save-dev tailwindcss @tailwindcss/postcss postcss`
  - Create a `.postcssrc.json` in your project root with the content `{ "plugins": { "@tailwindcss/postcss": {} } }`
- Make sure your project has the peer dependencies in `projects/practices-ui-ktbe/package.json` installed
- `npm install --save @nexplore/practices-ui-ktbe`
- Adjust your styles and add the fonts:
  - Add `@import '@nexplore/practices-ui-ktbe/tailwind.css';` at the top of your projects main CSS. It loads Tailwind, the KTBE theme and the sources of the library, so no `tailwind.config.js` is needed in your project
  - Copy the Roboto-Fonts in `projects/samples-ktbe/src/assets/fonts` into your project
  - Copy the `@font-face` CSS in `projects/samples-ktbe/src/styles.css` into your projects main CSS and adjust the paths to the font files
- If your project needs its own Tailwind customizations, create a `tailwind.config.js` with `presets: [require('@nexplore/practices-ui-ktbe/tailwind.config.js')]` and load it with `@config` instead of importing the shipped `tailwind.css` (see the [migration guide](./MigrationGuides.md#upgrading-to-1400))
- Adjust your main.ts: Add `providePracticesKtbe({...}` to the providers array
- You may also need the `provideAnimations()` from `@angular/platform-browser/animations`.

## Additional Practices Libraries

- `npm install --save @nexplore/practices-ng-commands`
- `npm install --save @nexplore/practices-ng-common-util`
- `npm install --save @nexplore/practices-ng-dirty-guard`
- `npm install --save @nexplore/practices-ng-forms`
- `npm install --save @nexplore/practices-ng-list-view-source`
- `npm install --save @nexplore/practices-ng-logging`
- `npm install --save @nexplore/practices-ng-signals`
- `npm install --save @nexplore/practices-ng-status`
- `npm install --save @nexplore/practices-ng-status-types`
