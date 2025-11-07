## ng-add Schematic Plan

Goal: Provide a first‑time installation experience that (1) copies required library theme asset(s) exactly like other code files, (2) injects the `providePracticesTailwind()` provider into the host application's bootstrap configuration (following imported indirections), (3) bootstraps a shell component via the existing `add-component` schematic, and (4) prints a short tutorial with next steps.

### High-Level Steps

1. Discover available themes from packaged schematic assets: `theme.css` (default) plus any `theme-*.css` under `schematics/ng-add/files` (or already present in snapshot).
2. Validate the requested `--theme` option (fallback to `theme.css`).
3. Copy the selected theme file EXACTLY like a normal code file (no renaming) into the same destination pattern as other snapshot files: `<destRoot>/<theme-file>`.
4. Provider Injection via AST (robust even with imported config):
    - Parse `src/main.ts` for `bootstrapApplication()`.
    - If second arg missing: add inline object with providers array.
    - If second arg object: ensure providers array and append call if missing.
    - If second arg identifier: open (one-level) config file (e.g. `/src/app/app.config.ts`) and mutate its object (add or extend providers array).
5. Chain shell component creation (`add-component` with `names=shell` & `rewriteImports=true`).
6. Log tutorial / next steps (add components, update, switch theme).

### Dynamic Theme Discovery Strategy

Enumerate files in `/schematics/ng-add/files` matching `^theme(-.*)?\.css$`. Always ensure `theme.css` is in the final set (insert if absent). This avoids reliance on build-time manifest generation for initial implementation.

### Schema Options

| Option         | Type    | Default     | Notes                                            |
| -------------- | ------- | ----------- | ------------------------------------------------ |
| `theme`        | string  | `theme.css` | Must match discovered list; fallback if invalid. |
| `skipShell`    | boolean | false       | Skip shell component generation.                 |
| `skipProvider` | boolean | false       | Skip provider injection.                         |

### Provider AST Details

Use TypeScript compiler API:

1. Locate `bootstrapApplication` call.
2. Branch by second argument type (none/object/identifier).
3. Object mutation ensures idempotency (no duplicate provider invocation).
4. Identifier resolution: naive single file (`/src/app/app.config.ts`) scan for variable with matching name; mutate object literal similarly.

### Theme Copy

Theme file is read from `/schematics/ng-add/files/<filename>` and written to `/<destRoot>/<filename>` where `destRoot` is existing hash DB dest or default `src/practices-ui-tailwind` (if hash DB not yet created). Hash DB update is deferred to future (not required for theme assets because they are treated as static shared files; can be integrated later if desired).

### Tutorial Logging

After chain completes log:

1. Selected theme & provider injection status.
2. Command to add a component.
3. Command to update components.
4. How to switch theme (edit import or rerun add with different theme, then adjust styles if necessary).

### Edge Cases

| Case                         | Handling                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| No `main.ts`                 | Warn & continue.                                                                          |
| Missing bootstrap call       | Warn & continue.                                                                          |
| Config identifier unresolved | Fallback to main.ts inline injection (not yet implemented; current version logs warning). |
| Provider already present     | Skip injection gracefully.                                                                |
| Theme invalid                | Fallback to default with warning.                                                         |

### Future Enhancements

- Add radio selection for available themes when ng-add is called without parameters.
- Multi-level identifier resolution across re-exports.
- Hash DB integration for theme assets.
- Dry-run mode.
- Interactive prompt for theme selection.

