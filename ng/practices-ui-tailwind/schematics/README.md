# @nexplore/practices-ui-tailwind Schematics

This directory contains the Angular schematics that ship with `@nexplore/practices-ui-tailwind`.

## Overview

The schematics provide automation for installing and synchronizing UI component source code from the library's internal snapshot into a host Angular application. They:

- Copy selected component source trees (and required dependencies) into your app under `src/practices-ui-tailwind/...`.
- Rewrite relative imports so copied code references the local copies.
- Maintain a hash database (`.practices-ui/schematics.hashdb.json`) to enable incremental / idempotent re-runs.
- Optionally update previously generated components to newer snapshots while preserving unchanged files.

## Available Schematics

### add-component

Copies one or more components (plus their transitive dependency components) from the packaged snapshot into the destination folder.

Command example:

```
ng g @nexplore/practices-ui-tailwind:add-component \
  --names breadcrumb,header \
  --dest src/app/ui \
```

Key behaviors:

- Components are defined in the generated `component-manifest.json` (bundled at `dist/.../schematics/add-component/files/component-manifest.json`).
- All files within a component folder plus whitelisted shared files are planned for copy.
- Existing identical files are skipped (reported as Identical).
- The summary line shows Created / Identical counts.

### update-components

(Re)applies the latest snapshot for already generated components, copying any new or changed files while leaving locally modified files in place unless content differs (no overwrite without change detection).

Usage example (update every previously installed component):

```
ng g @nexplore/practices-ui-tailwind:update-components
```

Or target specific components:

```
ng g @nexplore/practices-ui-tailwind:update-components \
  --names breadcrumb,header
```

## Options (Common)

| Option              | Required                               | Description                                                                                                                                          |
| ------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--names`           | For add / optional for update          | Comma separated component names (matches manifest keys). If omitted for update, all previously installed components (seen in hash DB) are processed. |
| `--dest`            | No (Default: src/practices-ui-tailwind | Destination root in the consuming app                                                                                                                |
| `--rewrite-imports` | No (Default: true)                     | Enables relative import rewriting to ensure intra-copied references point to local copies.                                                           |

## File Layout

After a run (example for `breadcrumb`):

```
src/app/practices-ui-tailwind/
  lib/
    breadcrumb/
      breadcrumb.component.ts
      ...
    header/
    common/
    ...
.practices-ui/
  schematics.hashdb.json
```

## Hash Database

`.practices-ui/schematics.hashdb.json` records:

- List of runs (timestamp + components processed).
- File path → content hash at time of copy.
  This enables idempotent behavior—re-running add-component with the same snapshot produces only Identical entries.

## Whitelist

Certain non-component patterns are auto-copied when referenced:

- `lib/**`
- `*.module.ts` (root-level modules in snapshot)
- `styles.css`

## Version / Snapshot

At build time a snapshot of `src/lib` is copied into `dist/.../schematics/add-component/files/src/lib`. The manifest is generated from that snapshot ensuring consistency between what the schematics plan and what is delivered.

## Minimatch Dependency

Pattern matching relies on `minimatch` (declared as an allowed non-peer dependency). It is used only inside schematics; it does not affect runtime bundle size.

## Idempotency / Safety

- Files are only created if absent or content differs.
- Re-run shows `Created=0, Identical=N` for unchanged snapshot.
- Import rewriting only touches relative specifiers inside the planned copy set.

## Troubleshooting

| Symptom                                                      | Likely Cause                                | Action                                                              |
| ------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------- |
| `Expected component directory missing` in integration script | Script out of sync with path layout         | Update script EXPECTED_DIR to include `/lib/`.                      |
| `minimatch is not a function`                                | Host resolved legacy v3                     | Ensure minimatch >=9 installed (packaged dependency provides this). |
| Components not found                                         | Wrong `--names` casing or manifest mismatch | Inspect bundled `component-manifest.json`.                          |

## Future Enhancements (Ideas)

- Rename 'add-component' to a shorter name, such as just 'add'.
- If add schematic is called without params, it should present a list of all components we can add, that we can check and then just hit enter, without typing every component name.
- Dry-run mode (`--dry-run`) to preview plan.
- Selective exclusion patterns.
- Update schematic conflict reporting (local modifications vs snapshot).

---

Maintained as part of `@nexplore/practices-ui-tailwind`. Update this README whenever schematic behavior or options change.

