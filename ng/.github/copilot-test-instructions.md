# Typescript Unit-tests 
- File name should end with `.spec.ts`.
- When using angular features, use `TestBed.runInInjectionContext(fn)` (import from `@angular/core/testing`).
- When testing `signal` or `effect` (from `@angular/core`) related code, call `TestBed.flushEffects()` between changing state, and before the first time reading out any result, such as signal values.
- Avoid complex Angular component fixtures, unless actually testing components
- Avoid multiple `expect` statements in the middle of the test, instead, store the results in an array and use one `expect(results).toEqual([...])` at the end.
- When working with observables or times, use `jest.useFakeTimers()` and call `await jest.runAllTimersAsync()` or `jest.advanceTimersByTime` to advance virtual time.
- When a test would check multiple variants of the same test, split it up into multiple tests.
- After writing tests, directly check your work by running the tests with `npx nx test PACKAGENAME`, for example: `npx nx test practices-ng-signals`