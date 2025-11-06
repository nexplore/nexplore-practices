import { isObjShallowEqual } from './is-obj-shallow-equal';

/**
 * Compares two objects deeply, recursively comparing nested objects.
 *
 * Special cases for property types:
 * - If the property is a function, it will be ignored.
 * - If the property is an Error, it will be compared by its message.
 * - If the property is a Date, it will be compared by its timestamp.
 * - Cyclic references are properly handled.
 *
 * @param obj1 The first object to compare.
 * @param obj2 The second object to compare.
 * @param options Options for comparison (maximumDepth, propertyFilter, customComparator).
 * @returns `true` if the objects are deeply equal, `false` otherwise.
 */
export function isObjDeepEqual(
    obj1: any,
    obj2: any,
    options?: {
        maximumDepth?: number,
        propertyFilter?: (key: string) => boolean,
        customComparator?: (value1: any, value2: any, key: string) => boolean | undefined
    },
    visited: Map<any, Set<any>> = new Map()
): boolean {
    const maximumDepth = options?.maximumDepth ?? 10;

    // Base case: if maximum depth reached, do shallow comparison
    if (maximumDepth <= 0) {
        return isObjShallowEqual(obj1, obj2, options?.propertyFilter, options?.customComparator);
    }

    if (obj1 === obj2) {
        return true;
    }

    if (!obj1 || !obj2) {
        return false;
    }

    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        // Handle cyclic references
        if (visited.has(obj1)) {
            const visitedObj2Set = visited.get(obj1);
            if (visitedObj2Set?.has(obj2)) {
                return true; // Already visited this pair
            }
        }
        
        // Record that we're comparing obj1 with obj2
        if (!visited.has(obj1)) {
            visited.set(obj1, new Set([obj2]));
        } else {
            visited.get(obj1)!.add(obj2);
        }
        
        // Handle Date objects
        if (obj1 instanceof Date && obj2 instanceof Date) {
            return obj1.getTime() === obj2.getTime();
        }

        // Handle Error objects
        if (obj1 instanceof Error && obj2 instanceof Error) {
            return obj1.message === obj2.message;
        }

        const keysOfObj1And2Distinct = Object.keys(obj1)
            .concat(Object.keys(obj2))
            .filter(
                (value, index, array) =>
                    // Filter out duplicates
                    array.indexOf(value) === index
            );

        for (const key of keysOfObj1And2Distinct) {
            if (
                (typeof obj1[key] === 'function' && typeof obj2[key] === 'function') ||
                (typeof options?.propertyFilter === 'function' && !options.propertyFilter(key))
            ) {
                continue;
            }

            const customEquals = options?.customComparator?.(obj1[key], obj2[key], key);
            if (customEquals !== undefined) {
                if (!customEquals) {
                    return false;
                }
                continue;
            }

            if (obj1[key] !== obj2[key]) {
                // Recursively compare nested objects
                if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] !== null && obj2[key] !== null) {
                    const nestedEqual = isObjDeepEqual(
                        obj1[key],
                        obj2[key],
                        {
                            ...options,
                            maximumDepth: maximumDepth - 1, // Decrease depth for nested comparison
                        },
                        visited // Pass the visited map to track cycles
                    );
                    if (!nestedEqual) {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        }

        return true;
    }

    return obj1 === obj2;
}
