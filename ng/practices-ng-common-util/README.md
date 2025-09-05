# @nexplore/practices-ng-common-util

This library provides a set of utility functions that are commonly used by the other libraries in this workspace and may be useful in other Angular projects as well.

## Purpose

These utilities serve as building blocks for library authors and application developers, handling common patterns and edge cases that arise when building reusable, type-safe Angular components and services. They simplify complex operations like deep object comparison, signal handling, and working with asynchronous data.

## Features

-   **Object Comparison** - Compare objects with shallow or deep equality checks
-   **Signal Handling** - Utilities for working with Angular signals in a flexible way
-   **Observable Utilities** - Tools for converting between observables, promises, and values
-   **Property Access** - Safe access to properties that may be null or undefined
-   **Angular Component Helpers** - Base classes for pipes and lifecycle management
-   **Type Conversions** - Type-safe utilities for transforming data structures
-   **Object Manipulation** - Deep merging and object enhancement utilities
-   **Array and String Helpers** - Common operations on arrays and strings

## Installation

```bash
npm install @nexplore/practices-ng-common-util
```

## Features and Usage Examples

### Object and Array Comparison - [`isObjShallowEqual`](./src/lib/comparison/object-comparison.ts), [`isObjDeepEqual`](./src/lib/comparison/object-comparison.ts), [`isArrayEqual`](./src/lib/comparison/array-comparison.ts)

Utilities for comparing objects and arrays with different levels of strictness:

```typescript
import { isObjShallowEqual, isObjDeepEqual, isArrayEqual } from '@nexplore/practices-ng-common-util';

// Shallow equality (one level deep)
const obj1 = { name: 'John', age: 30 };
const obj2 = { name: 'John', age: 30 };
const areEqual = isObjShallowEqual(obj1, obj2); // true

// Deep equality with customization options
const deepObj1 = {
    user: { profile: { name: 'Alice', settings: { theme: 'dark' } } },
    metadata: { created: new Date('2023-01-01') },
};
const deepObj2 = {
    user: { profile: { name: 'Alice', settings: { theme: 'dark' } } },
    metadata: { created: new Date('2023-01-01') },
};
const areDeepEqual = isObjDeepEqual(deepObj1, deepObj2, {
    maximumDepth: 5,
    propertyFilter: (key) => key !== 'internal',
    customComparator: (val1, val2, key) => {
        if (key === 'created') return val1.getTime() === val2.getTime();
        return undefined; // use default comparison
    },
}); // true

// Array equality
const array1 = [1, 2, 3];
const array2 = [1, 2, 3];
const arraysEqual = isArrayEqual(array1, array2); // true
```

### Property Access - [`tryGetUntyped`](./src/lib/object/object-utils.ts), [`trySetUntyped`](./src/lib/object/object-utils.ts)

Safely access or modify properties on objects that may be null or undefined:

```typescript
import { tryGetUntyped, trySetUntyped } from '@nexplore/practices-ng-common-util';

const data = { user: { profile: { email: 'test@example.com' } } };

// Safely get a property (single level only)
const userData = tryGetUntyped<any>(data, 'user'); // { profile: { email: 'test@example.com' } }
const profileData = userData ? tryGetUntyped<any>(userData, 'profile') : undefined; // { email: 'test@example.com' }
const email = profileData ? tryGetUntyped<string>(profileData, 'email') : undefined; // 'test@example.com'

// Safely set a property
trySetUntyped(data, 'user', { profile: { email: 'updated@example.com' } });
```

### Signal Handling - [`unwrapSignal`](./src/lib/signal/signal-utils.ts), [`unwrapSignalLike`](./src/lib/signal/signal-utils.ts)

Utilities for working with Angular signals in flexible ways:

```typescript
import { unwrapSignal, unwrapSignalLike, ValueOrSignal } from '@nexplore/practices-ng-common-util';
import { signal, computed } from '@angular/core';

// Extract value from a signal
const mySignal = signal('hello');
const value = unwrapSignal(mySignal); // 'hello'

// unwrapSignalLike also handles functions
const myFunction = () => 'world';
const functionValue = unwrapSignalLike(myFunction); // 'world'

// Create flexible utility functions that accept values or signals
function computeFormattedName<T extends string>(nameOrSignal: ValueOrSignal<T>) {
    return computed(() => {
        const name = unwrapSignal(nameOrSignal);
        return name ? name.toUpperCase() : '';
    });
}

// Can be used with signals (will update reactively)
const nameSignal = signal('john');
const formattedNameSignal = computeFormattedName(nameSignal);
console.log(formattedNameSignal()); // "JOHN"

nameSignal.set('jane');
console.log(formattedNameSignal()); // "JANE" (updates automatically)

// Or with direct values
const staticNameSignal = computeFormattedName('mary');
console.log(staticNameSignal()); // "MARY"
```

### Observable and Async Utilities - [`isAsyncOrObservable`](./src/lib/observable/observable-utils.ts), [`firstValueFromMaybeAsync`](./src/lib/observable/observable-utils.ts)

Utilities for working with Observables, Promises, and direct values uniformly:

```typescript
import {
    isAsyncOrObservable,
    firstValueFromMaybeAsync,
    firstOrDefaultFromMaybeAsync,
    maybeAsyncToObservable,
    subscribeAndForget,
} from '@nexplore/practices-ng-common-util';
import { Observable, of, throwError } from 'rxjs';

// Type guard for async values
function processValue<T>(value: T | Promise<T> | Observable<T>) {
    if (isAsyncOrObservable(value)) {
        console.log('Value is a Promise or Observable');
    } else {
        console.log('Value is synchronous:', value);
    }
}

// Get first value from any source
const directResult = await firstValueFromMaybeAsync('hello'); // 'hello'
const promiseResult = await firstValueFromMaybeAsync(Promise.resolve('world')); // 'world'
const observableResult = await firstValueFromMaybeAsync(of('from observable')); // 'from observable'

// Get value with fallback for errors
const safeResult = await firstOrDefaultFromMaybeAsync(
    throwError(() => new Error('Failed')),
    'default'
); // 'default'

// Convert anything to Observable
const observable = maybeAsyncToObservable('hello world');
// observable will emit 'hello world' and then complete

// Subscribe without storing subscription
subscribeAndForget(of('fire and forget'));
```

### AbstractStatefulPipe - [`AbstractStatefulPipe`](./src/lib/angular/pipes.ts)

Base class for creating stateful pipes that handle async transformations:

```typescript
import { AbstractStatefulPipe } from '@nexplore/practices-ng-common-util';
import { Pipe } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
    name: 'customFormat',
    standalone: true,
})
export class CustomFormatPipe extends AbstractStatefulPipe<string, string> {
    override transformAsync(value: string): Observable<string> | Promise<string> | string {
        // Can return synchronous value
        return value.toUpperCase();

        // Or Promise
        // return Promise.resolve(value.toUpperCase());

        // Or Observable
        // return of(value).pipe(map(v => v.toUpperCase()));
    }
}
```

### Object Manipulation - [`deepMerge`](./src/lib/object/object-utils.ts), [`enhance`](./src/lib/object/object-utils.ts)

Utilities for combining and enhancing objects:

```typescript
import { deepMerge, enhance } from '@nexplore/practices-ng-common-util';

// Deep merge objects
const baseConfig = { logging: { level: 'error', enabled: true } };
const customConfig = { logging: { level: 'debug' } };
const mergedConfig = deepMerge(baseConfig, customConfig);
// Result: { logging: { level: 'debug', enabled: true } }

// Enhance objects with additional properties
const user = { id: 1, name: 'Alice' };
const enhancedUser = enhance(user, {
    fullName: {
        get: () => `${user.name} (ID: ${user.id})`,
    },
    isActive: true,
});
console.log(enhancedUser.fullName); // 'Alice (ID: 1)'
```

### Array and String Utilities - [`wrapArrayAndFilterFalsyValues`](./src/lib/array/array-utils.ts), [`firstCharToUpper`](./src/lib/string/string-utils.ts)

Helper functions for array and string manipulation:

```typescript
import { wrapArrayAndFilterFalsyValues, firstCharToUpper, firstCharToLower } from '@nexplore/practices-ng-common-util';

// Array wrapping and filtering
const result1 = wrapArrayAndFilterFalsyValues('item'); // ['item']
const result2 = wrapArrayAndFilterFalsyValues(['item1', null, 'item2', undefined]);
// ['item1', 'item2']

// String case helpers
const uppercase = firstCharToUpper('hello'); // 'Hello'
const lowercase = firstCharToLower('Hello'); // 'hello'
```

### Type Utilities - [`StringKeyOf`](./src/lib/types/type-utils.ts)

Type helpers for improved type safety:

```typescript
import { StringKeyOf } from '@nexplore/practices-ng-common-util';

interface User {
    id: number;
    name: string;
    email: string;
}

// Function that retrieves a property by key
function getProperty<T, K extends StringKeyOf<T>>(obj: T, key: K): T[K] {
    return obj[key];
}

const user: User = { id: 1, name: 'Alice', email: 'alice@example.com' };
getProperty(user, 'name'); // 'Alice' (type-safe)
```

## Integration with Other Libraries

This utility library serves as a foundation for other practices packages:

-   **[@nexplore/practices-ng-signals](../practices-ng-signals/README.md)** - Uses the signal utilities
-   **[@nexplore/practices-ng-commands](../practices-ng-commands/README.md)** - Leverages async and signal utilities
-   **[@nexplore/practices-ng-forms](../practices-ng-forms/README.md)** - Uses object comparison and type utilities

## Running unit tests

Run `npx nx test practices-ng-common-util` to execute the unit tests.
