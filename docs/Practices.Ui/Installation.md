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
- `pnpm install --save @nexplore/practices-ui`
- Add `providePractices({...})` to the providers array in your main.ts

## practices-ui-clarity

- Make sure your project has the peer dependencies in `projects/practices-ui-clarity/package.json` installed
- Make sure to follow the official [Clarity Installation Guide](https://clarity.design/documentation/get-started) to install Clarity in your project
- `pnpm install --save @nexplore/practices-ui-clarity`

## practices-ui-ktbe

- practices-ui-ktbe is based on TailwindCSS. Follow the offical TailwindCSS [Installation Guide](https://tailwindcss.com/docs/guides/angular)
- Make sure your project has the peer dependencies in `projects/practices-ui-ktbe/package.json` installed
- `pnpm install --save @nexplore/practices-ui-ktbe`
- Adjust your `tailwind.config.js`:
  - Copy the `projects/samples-ktbe/tailwind.config.js` into your project
  - Adapt the import of the ktbeTheme: `const ktbeTheme = require('./node_modules/@nexplore/practices-ui-ktbe/tailwind.config.js');`
  - Adapt the `content: []` section: `content: ['./node_modules/@nexplore/practices-ui-ktbe/esm2020/**/*.mjs', './src/**/*.{html,ts}'],`
- Adjust your styles and add the fonts:
  - Copy the Roboto-Fonts in `projects/samples-ktbe/src/assets/fonts` into your project
  - Copy the CSS in `projects/samples-ktbe/src/styles.css` into your projects main CSS and adjust the paths to the font files
- Adjust your main.ts: Add `providePracticesKtbe({...}` to the providers array
- You may also need the `provideAnimations()` from `@angular/platform-browser/animations`.

## Additional Practices Libraries

- `pnpm install --save @nexplore/practices-ng-commands`
- `pnpm install --save @nexplore/practices-ng-common-util`
- `pnpm install --save @nexplore/practices-ng-dirty-guard`
- `pnpm install --save @nexplore/practices-ng-forms`
- `pnpm install --save @nexplore/practices-ng-list-view-source`
- `pnpm install --save @nexplore/practices-ng-logging`
- `pnpm install --save @nexplore/practices-ng-signals`
- `pnpm install --save @nexplore/practices-ng-status`
- `pnpm install --save @nexplore/practices-ng-status-types`
