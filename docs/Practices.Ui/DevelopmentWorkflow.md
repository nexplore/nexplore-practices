# Development Workflow

The Angular libraries and the samples are all part of the same Angular Workspace.

Incorporate samples for each new functionality you build. It helps with implementing the functionality and to increase maintainability in the future.

## Build and Start

To get things running, you have to decide which samples you want to run, NX will automatically build the dependencies:

Samples (Clarity):

- Run the Samples: `pnpm run start-clarity`

Samples (Kanton Bern):

- Run the Samples: `pnpm run start-ktbe`

## Run Tests

You can run all Unit Tests by executing `pnpm test`. You can add the library specific names after it to only execute tests for a specific project.

## Lint

Execute `pnpm run lint` before you issue a PR to ensure that the code fulfills our conventions.

## Practices.Ui.KtBE Do's and Don'ts

### Styling Approach

- DO use Tailwind classes as the primary way to style your elements
- DO use `@apply` when authoring components to improve readability and maintainability
- When styling the root of a component, use `:where(puibe-component-name)` in combination with `ViewEcapsulation.None`, so the internal styles can be easily be overridden from the outside.
- AVOID using `@HostBinding("className")`
  - For static styles on the component root, use `@apply`
  - For dynamic styles on the component root, use `data-attributes`
- AVOID declaring custom CSS classes unless necessary
- DO use arbitrary values, properties or variants when the concrete value, CSS property, or CSS modifier is not covered by Tailwind or the Theme

### Data Attributes

- DO follow the [data-attributes](https://www.w3schools.com/TAGS/att_data-.asp) convention when custom styles beyond Tailwind are needed

### Style Sharing and Reusability

- DO share styles by extracting components or directives in Angular

- DO use Tailwind v4 [@theme variables](https://tailwindcss.com/docs/theme) for values used in multiple places
  - Alternatively, configure new theming variables or base styles in tailwind.config.js
- DO configure new utility classes, component classes or variants using the Tailwind plugin system for styles used across components
