# Visual regression tests

Screenshots every story of the `practices-ui-ktbe` Storybook with [Playwright](https://playwright.dev) (desktop 1280px and mobile 390px) and compares them pixel by pixel against a reference. Use it to verify that an upgrade (Angular, Tailwind, ...) or a refactoring does not change how the components look.

## Compare against a release or branch

```bash
npx playwright install chromium   # once
npm run visual:compare -- 12.1.2 --node 22.14.0
```

The script

1. checks out the given git ref (tag, branch or commit) into a separate worktree in `tmp/visual-baseline`, installs its dependencies and builds its Storybook,
2. screenshots every story of that build as reference (`visual-tests/__screenshots__`),
3. builds the Storybook of your working tree and compares every story against the reference.

The reference is built with the Node version from its `ng/.nvmrc`. For refs without `.nvmrc` (12.x and older), pass the version with `--node`. Switching Node versions needs [fnm](https://github.com/Schniz/fnm); without it the current Node version is used. Dependencies of the reference are only reinstalled when its `package-lock.json` changed, so later runs are much faster.

| Option            | Description                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- |
| `--node <v>`      | Node version for building the reference.                                            |
| `--filter <re>`   | Only compare stories whose id matches the regular expression, e.g. `button\|toast`. |
| `--skip-baseline` | Reuse the existing reference screenshots.                                           |
| `--skip-build`    | Don't rebuild the Storybook of the working tree.                                    |

Open the report with the expected, actual and diff image of every changed story:

```bash
npm run visual:report
```

## Iterating on a fix

Once the reference screenshots exist, rebuild Storybook and only rerun the comparison:

```bash
npm run build-storybook-ktbe
npm run visual:test
```

To only run some stories, set `VISUAL_FILTER` to a regular expression matching the story ids (`VISUAL_FILTER=toast npm run visual:test` in bash, `$env:VISUAL_FILTER='toast'` in PowerShell).

## Determinism

The screenshots are only meaningful if a story renders identically every time. The test therefore

- freezes the clock at a fixed date and fast-forwards all timers by 30 seconds after rendering (async validators, simulated requests, status messages, ...),
- replaces `Math.random` with a seeded generator,
- disables CSS animations and pauses SVG (SMIL) animations, e.g. the spinner.

A story that still renders non-deterministically can be excluded with the `no-visual-test` tag:

```ts
export const Random: Story = { tags: ['no-visual-test'] };
```

Screenshots depend on the operating system's font rendering. Reference and comparison must therefore run on the same machine, which is why the screenshots are not committed.
