function isPlainObject(value: unknown): value is Record<string, any> {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}

function mergeRecursive(target: Record<string, any>, source: Record<string, any>, visited: WeakSet<object>): void {
    if (visited.has(source)) {
        return;
    }
    visited.add(source);

    for (const [key, value] of Object.entries(source)) {
        if (value === undefined) {
            continue;
        }

        if (isPlainObject(value) && isPlainObject(target[key])) {
            // Copy the nested object before merging into it, so the caller's objects are never mutated
            const nested = { ...target[key] };
            mergeRecursive(nested, value, visited);
            target[key] = nested;
        } else {
            // Arrays, functions, class instances, Dates, Maps, Sets, primitives and plain objects
            // without a plain counterpart replace the existing value by reference
            target[key] = value;
        }
    }
}

type DeepPartial<T> =
    T extends Record<string, any>
        ? {
              [P in keyof T]?: DeepPartial<T[P]>;
          }
        : T;

/**
 * Deeply merges `newOptions` into a copy of `options`.
 *
 * - Only plain objects (prototype `Object.prototype` or `null`) are merged recursively.
 * - All other values (arrays, functions, class instances, Dates, Maps, Sets, ...) replace the existing value by reference.
 *   Arrays are not merged element by element.
 * - `undefined` values in `newOptions` are ignored.
 * - Neither `options` nor `newOptions` are mutated; plain objects along the merge path are shallow copied.
 * - Circular references in `newOptions` are tolerated.
 */
export function deepMerge<T extends Record<string, any>>(options?: T, newOptions?: DeepPartial<T>): T {
    const merged: any = { ...options };

    if (isPlainObject(newOptions)) {
        mergeRecursive(merged, newOptions, new WeakSet());
    }

    return merged;
}
