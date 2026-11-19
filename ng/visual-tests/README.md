# Visual regression tests

Screenshots the KTBE components with [Playwright](https://playwright.dev) (desktop 1280px and mobile 390px) and compares them pixel by pixel against a reference. Use it to verify that an upgrade (Angular, Tailwind, ...) or a refactoring does not change how the components look.

| Spec                   | What is captured                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `storybook.spec.ts`    | Every story of the `practices-ui-ktbe` Storybook (full page).                                                                          |
| `interactions.spec.ts` | States that need an interaction: keyboard focus, opened selects, calendars, dropdowns, tooltips, dialogs and flyouts, expanded panels. |
| `samples.spec.ts`      | Every page of `samples-ktbe`, i.e. the components together in the shell, plus opened side overlay panel and mobile menu.               |

## Committed screenshots

The screenshots in `visual-tests/__screenshots__` are committed with [Git LFS](https://git-lfs.com) (run `git lfs install` once). They are taken in the official Playwright Docker image, because the font rendering differs between operating systems: screenshots taken on Windows or macOS do not match the committed ones.

The baseline was created from release 12.1.2. A change that affects the look updates the screenshots in the same pull request, so the review shows the visual changes next to the code:

```bash
npm run build-storybook-ktbe
npx nx build samples-ktbe --configuration production
npm run visual:docker                              # compare against the committed screenshots
npm run visual:docker -- --update-snapshots=all    # update them after an intended change
```

`visual:docker` needs Docker (e.g. Docker Desktop or Rancher Desktop) and uses the image matching the installed `@playwright/test` version.

## Compare against a release or branch

```bash
npx playwright install chromium   # once, only needed without --docker
npm run visual:compare -- 12.1.2 --node 22.14.0 --docker
```

The script

1. checks out the given git ref (tag, branch or commit) into a separate worktree in `tmp/visual-baseline`, installs its dependencies and builds its Storybook and `samples-ktbe`,
2. screenshots everything of that build as reference (`visual-tests/__screenshots__`),
3. builds your working tree and compares everything against the reference.

The reference is built with the Node version from its `ng/.nvmrc`. For refs without `.nvmrc` (12.x and older), pass the version with `--node`. Switching Node versions needs [fnm](https://github.com/Schniz/fnm); without it the current Node version is used. Dependencies of the reference are only reinstalled when its `package-lock.json` changed, so later runs are much faster.

| Option            | Description                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `--node <v>`      | Node version for building the reference.                                                     |
| `--filter <re>`   | Only compare story ids / sample pages matching the regular expression, e.g. `button\|toast`. |
| `--skip-baseline` | Reuse the existing reference screenshots.                                                    |
| `--skip-build`    | Don't rebuild the working tree.                                                              |
| `--docker`        | Take the screenshots in the Playwright Docker image (needed to compare with committed ones). |

Open the report with the expected, actual and diff image of every change:

```bash
npm run visual:report
```

Stories, interactions or pages that don't exist in the reference (e.g. new stories) are reported as missing screenshots.

## Iterating on a fix

Once the reference screenshots exist, rebuild and only rerun the comparison:

```bash
npm run build-storybook-ktbe
npx nx build samples-ktbe --configuration production
npm run visual:test
```

To only run some screenshots, set `VISUAL_FILTER` to a regular expression matching the story ids or sample pages (`VISUAL_FILTER=toast npm run visual:test` in bash, `$env:VISUAL_FILTER='toast'` in PowerShell).

The builds are served on the ports 6106 (Storybook) and 6206 (samples). Override them with `VISUAL_STORYBOOK_PORT` and `VISUAL_SAMPLES_PORT` if they are in use.

## Adding coverage

- A new story is covered automatically.
- For a state that needs an interaction, add an entry to `INTERACTIONS` in `interactions.spec.ts`.
- For a new page of `samples-ktbe`, add its path to `PAGES` in `samples.spec.ts`.

## Determinism

The screenshots are only meaningful if a story renders identically every time. The test therefore

- freezes the clock at a fixed date and fast-forwards all timers by 30 seconds after rendering and after each interaction (async validators, simulated requests, status messages, ...), then gives work triggered outside of the fake clock (e.g. `ResizeObserver` callbacks) a moment and fast-forwards again,
- replaces `Math.random` with a seeded generator,
- disables CSS animations and pauses SVG (SMIL) animations, e.g. the spinner.

A story that still renders non-deterministically can be excluded with the `no-visual-test` tag:

```ts
export const Random: Story = { tags: ['no-visual-test'] };
```

Stories using `randomAsyncValidator` are deterministic within one version, but not across versions (the number of `Math.random` calls of Angular and Storybook differs), so expect differences there when comparing against an older release.

Screenshots depend on the operating system's font rendering. Reference and comparison must therefore run on the same platform: use `--docker` / `npm run visual:docker`. Without Docker (`npm run visual:test`), only compare against screenshots taken on the same machine.

Note that `visual:compare` replaces the screenshots in `__screenshots__` with the ones of the given ref. Restore the committed ones with `git checkout -- visual-tests/__screenshots__` afterwards.
