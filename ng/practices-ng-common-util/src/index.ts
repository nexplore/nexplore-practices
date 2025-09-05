// Object comparison
export * from './lib/is-obj-shallow-equal';
export * from './lib/is-obj-deep-equal';
export * from './lib/is-array-equal';

// Property access
export * from './lib/try-get-untyped';
export * from './lib/try-set-untyped';

// Signal handling
export * from './lib/unwrap-signal-like';
export * from './lib/unwrap-signal';

// Observable and async handling
export * from './lib/is-async-or-observable';
export * from './lib/first-value-from-maybe-async';
export * from './lib/first-or-default-from-maybe-async';
export * from './lib/maybe-async-to-observable';
export * from './lib/subscribe-and-forget';

// Angular utilities
export * from './lib/try-destroy-injector';

// Keep existing exports from other modules
export * from './lib/array.util';
export * from './lib/deep-merge.util';
export * from './lib/string.util';
export * from './lib/types';
export * from './lib/abstract-stateful.pipe';
export * from './lib/enhance-util';
