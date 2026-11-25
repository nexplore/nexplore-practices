# Angular 21 compatibility check

The practices libraries are built with Angular 22, but their peer ranges also allow Angular 21.2 (`>=21.2.0 <23.0.0`). This app checks the lower bound of these ranges. The CI runs it after `./build.sh BuildPackAll`.

`verify.sh` packs every library from `ng/dist`, copies this app to a temporary folder outside of the repository (so nothing is resolved from the Angular 22 packages in `ng/node_modules`), installs the packages and runs `ng build` and `ng test`. The app uses the lowest supported versions (Angular 21.2.0, CDK 21.2.0, ng-select 21.0.0, Clarity 18.4.0, ngx-translate 17.0.0, Tailwind CSS 3.2.4, TypeScript 5.9). The check fails if:

-   npm rejects a peer range (no `--legacy-peer-deps`)
-   the Angular 21 linker cannot process a partial declaration of the libraries
-   a library imports an API that does not exist in one of these versions
-   the bundled `.d.ts` files or a template do not type-check (`skipLibCheck: false`, `strictTemplates`)
-   `src/app/select.spec.ts` fails: it renders `practices-ui-ktbe` selects with a `SelectViewSource` (fixed items and remote search) on ng-select 21.0.0 and again on 21.8.2 (Vitest, jsdom), because the select directives rely on ng-select internals

Other runtime behaviour on Angular 21 is not covered, and the styles are not checked.

## Run locally

```bash
cd ng
npm ci
npm run build-all
bash compat/angular-21/verify.sh
```

## Drop Angular 21

Remove this folder and the step in `.github/workflows/build.template.yml`, and raise the Angular peer ranges of the libraries to `>=22.0.0` (and the ng-select range of `practices-ui-ktbe` to `>=24.0.0 <25.0.0`). This is a breaking change.
