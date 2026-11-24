# Angular 21 compatibility check

The practices libraries are built with Angular 22, but their peer ranges also allow Angular 21.2 (`>=21.2.0 <23.0.0`). This app checks the lower bound of these ranges. The CI runs it after `./build.sh BuildPackAll`.

`verify.sh` packs every library from `ng/dist`, installs the packages into this app and runs `ng build`. The app uses the lowest supported versions (Angular 21.2.0, CDK 21.2.0, ng-select 21.0.0, Clarity 18.4.0, ngx-translate 17.0.0, TypeScript 5.9). The check fails if:

-   npm rejects a peer range (no `--legacy-peer-deps`)
-   the Angular 21 linker cannot process a partial declaration of the libraries
-   a library imports an API that does not exist in one of these versions
-   the bundled `.d.ts` files or a template do not type-check (`skipLibCheck: false`, `strictTemplates`)

It does not run the app or any tests, so runtime behaviour on Angular 21 is not covered.

## Run locally

```bash
cd ng
npm ci
npm run build-all
bash compat/angular-21/verify.sh
```

## Drop Angular 21

Remove this folder and the step in `.github/workflows/build.template.yml`, and raise the peer ranges of the libraries to `>=22.0.0`. This is a breaking change.
