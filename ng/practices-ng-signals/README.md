# @nexplore/practices-ng-signals

This library provides a set of utilities to simplify working with Angular signals and effects in real-world applications. It bridges some gaps in the Angular signals API and provides convenient ways to work with signals, effects, and observables together.

## Purpose

Angular's signals API introduced a powerful new reactive primitive, but there are common patterns and use cases that can benefit from higher-level utilities. This library addresses those needs by providing utilities for effect management, conversion between reactive types, and enhanced signal operations.

## Features

- **Signal and Effect Organization** - Organize effects alongside signal declarations for improved code readability
- **Automatic Subscription Management** - Create effects that properly manage RxJS subscriptions with automatic cleanup
- **Signal Transformations** - Apply transformations to signal values similar to RxJS pipe operators
- **Type Conversion Utilities** - Convert between signals, observables, promises, and plain values
- **Lazy Signal Creation** - Create signals from observables with optimized lazy initialization

## Installation

```bash
pnpm install @nexplore/practices-ng-signals
```

## Features and Usage Examples

### Signal and Effect Organization - [`withEffects`](./src/lib/effects-utils.ts)

Angular effects are often defined separately from the signals they depend on, which can make code harder to follow. The `withEffects` utility allows you to organize effects alongside the signals they rely on, improving readability and maintainability.

```typescript
import { signal, effect } from '@angular/core';
import { withEffects } from '@nexplore/practices-ng-signals';

@Component({...})
export class MyComponent {
  protected readonly counterSignal = withEffects(
    signal(0),
    effect(() => {
      const value = this.counterSignal();
      console.log(`Counter changed to: ${value}`);
      // Perform side effects when counter changes
    })
  );

  // The counterSignal is returned unchanged, but the effect is organized alongside it
}
```

### Automatic Subscription Management - [`subscriptionEffect`](./src/lib/effects-utils.ts)

The `subscriptionEffect` utility simplifies working with observables in signal-based components by automatically managing subscriptions, including proper cleanup when components are destroyed.

```typescript
import { subscriptionEffect } from '@nexplore/practices-ng-signals';
import { interval } from 'rxjs';

@Component({...})
export class MyComponent {
  constructor() {
    // Subscription is automatically cleaned up when component is destroyed
    subscriptionEffect(() => {
      return interval(1000).subscribe(value => {
        console.log(`Tick: ${value}`);
      });
    });
  }
}
```

### Signal Transformations - [`computedPipe`](./src/lib/computed-pipe.ts)

Apply a series of transformations to a signal value, similar to RxJS pipe but returns a signal (shorthand for toSignal with pipe).

```typescript
import { signal } from '@angular/core';
import { computedPipe } from '@nexplore/practices-ng-signals';
import { map, filter } from 'rxjs/operators';

@Component({...})
export class MyComponent {
  private readonly _valueSignal = signal(10);

  // Transform the signal value through a series of operations
  protected readonly transformedValueSignal = computedPipe(
    this._valueSignal,
    map(value => value * 2),
    filter(value => value > 15)
  );

  // Result: signal that will have the value 20 (10 * 2)
}
```

### Type Conversion Utilities

When authoring library functions, services, or components, we often want to accept flexible input types that could be asynchronous or not. These utilities make APIs more flexible:

#### [`anyToSignal`](./src/lib/any-to-signal.ts) - Convert to Signal

Converts various value types (observables, promises, signals, plain values) to signals:

```typescript
import { anyToSignal } from '@nexplore/practices-ng-signals';

// Convert an observable to a signal
const mySignal = anyToSignal(myObservable$, initialValue);

// Convert a promise to a signal
const promiseSignal = anyToSignal(fetchData(), 'loading...');

// Pass through an existing signal
const existingSignal = signal(5);
const resultSignal = anyToSignal(existingSignal); // Simply returns the original signal

// Convert a plain value
const valueSignal = anyToSignal(42); // Creates signal(42)
```

#### [`anyToObservable`](./src/lib/any-to-observable.ts) - Convert to Observable

Converts various value types (signals, promises, observables, plain values) to observables:

```typescript
import { anyToObservable } from '@nexplore/practices-ng-signals';
import { signal } from '@angular/core';

// Convert a signal to an observable
const mySignal = signal(42);
const myObservable$ = anyToObservable(mySignal);

// Convert a promise to an observable
const promiseObservable$ = anyToObservable(fetchData());

// Pass through an existing observable
const resultObservable$ = anyToObservable(existingObservable$);

// Convert a plain value to an observable
const valueObservable$ = anyToObservable(42); // Creates of(42)
```

#### [`toSignalLazy`](./src/lib/to-signal-lazy.ts) - Lazy Signal Creation

Create a signal from an observable with lazy initialization, which can be useful for performance optimization:

```typescript
import { toSignalLazy } from '@nexplore/practices-ng-signals';
import { Observable } from 'rxjs';

// Create a signal that doesn't subscribe to the observable
// until the signal is accessed for the first time
const expensiveDataSignal = toSignalLazy(() => this.dataService.fetchExpensiveData(), { initialValue: null });

// The subscription only starts when expensiveDataSignal() is called
```

## Integration with Other Libraries

This library works well with:

- **[@nexplore/practices-ng-commands](../practices-ng-commands/README.md)** - Commands use signals for state management
- **[@nexplore/practices-ng-forms](../practices-ng-forms/README.md)** - Form validation and state management with signals
- **[@nexplore/practices-ng-status](../practices-ng-status/README.md)** - Status tracking with signals

## Running unit tests

Run `nx test practices-ng-signals` to execute the unit tests.

## Contributing

When adding new utilities, please include appropriate unit tests and documentation.

