---
name: documentation-codebase-sync
description: Verify, improve, and synchronize Markdown documentation against the actual local codebase. Use when Codex is asked to audit or fix README files, docs, API examples, package usage snippets, selectors, config examples, exports, imports, signatures, or local Markdown links based on implementation reality rather than text-only matching.
---

# Documentation Codebase Sync

## Mission

Keep docs honest against the repository. Prefer local source truth over assumptions. Make conservative documentation edits only when evidence is clear.

Use this skill for requests like:

- "Check these docs against the codebase."
- "Fix README examples that no longer match exports."
- "Verify Angular selectors and service APIs in docs."
- "Find dead local Markdown links."
- "Sync package documentation with implementation."

## Workflow

1. Clarify scope.
   - Identify documentation files to check.
   - Identify code packages or modules that are source of truth.
   - Ask whether the user wants analysis only or fixes too when unclear.
   - Example scope: `docs/Practices.Ui`, `ng/*/README.md`, source truth `ng/*/src/index.ts`.

2. Read repo rules and protect local work.
   - Read relevant `AGENTS.md` or repo instructions first.
   - Run `git status --short --branch`.
   - Do not overwrite unrelated or user-made changes.
   - Do not change implementation code unless explicitly requested.

3. Find real public APIs and implementation.
   - Use `rg` and `rg --files` first.
   - Inspect package entrypoints: `package.json`, `exports`, `main`, `module`, `types`, `index.ts`, project files.
   - Inspect implementation, not only barrel exports.
   - For frameworks, verify real selectors, inputs, outputs, config keys, providers, and service method names.

4. Extract docs evidence.
   - List Markdown files in scope.
   - Extract fenced code blocks, inline imports, package names, selectors, links, command snippets, and config examples.
   - Track each claim back to file and line where practical.

5. Verify examples semantically.
   - Check imports against package exports and entrypoints.
   - Check function calls against signatures and option shapes.
   - Check selectors against component/directive metadata.
   - Check service method names against actual classes.
   - Check config snippets against real schemas or consuming code.
   - Do not call a shortened example wrong unless the API, selector, import, link, or syntax is actually incompatible.

6. Edit docs conservatively.
   - Change the smallest text needed to match implementation.
   - Fix stale paths to real paths.
   - Correct broken local links to existing docs or source files.
   - Update imports, selectors, method names, and signatures to current code.
   - Remove or clearly mark packages/features that do not exist.
   - Preserve the surrounding documentation style.

7. Verify changes.
   - Run a local Markdown link check. If this skill is available on disk, use:

     ```bash
     node .codex/skills/documentation-codebase-sync/scripts/check-local-markdown-links.js --root . <docs-or-files>
     ```

   - Run targeted `rg` checks for old bad patterns.
   - Run project-specific checks when cheap and relevant, such as TypeScript compile, docs lint, package tests, or build.
   - If dependencies are missing, report exactly which verification could not run.
   - Do not run `npm install` or similar dependency installation unless there is a clear need and user approval.

8. Report result.
   - Findings: real mismatches found, with file references.
   - Changes: docs edits made.
   - Verification: commands run and outcomes.
   - Open points: uncertain examples, missing dependencies, external docs needing confirmation.

## Heuristics

- Treat local codebase as primary truth.
- Use official external docs only for framework/version facts or external APIs that the repo cannot prove.
- Prefer structured sources over string search: package exports, TypeScript declarations, component metadata, config schemas.
- Be careful with intentionally abbreviated docs examples.
- Avoid speculative rewrites.
- Keep implementation untouched unless the user asks for code changes.

## Common Mismatch Patterns

- Stale paths, for example `projects/*` after packages moved to `ng/*`.
- README mentions a package that no longer exists.
- Angular selector in docs differs from `selector` metadata.
- Service method name changed but docs still show old call.
- Function signature changed, for example positional args replaced by an options object.
- Markdown code block has syntax that would not parse.
- Local Markdown link points to a deleted or moved file.

## Link Check Script

`scripts/check-local-markdown-links.js` checks local Markdown links and same-file or target-file heading anchors without external dependencies.

Examples:

```bash
node .codex/skills/documentation-codebase-sync/scripts/check-local-markdown-links.js --root . docs README.md
node .codex/skills/documentation-codebase-sync/scripts/check-local-markdown-links.js ng/practices-ng-signals/README.md
```
