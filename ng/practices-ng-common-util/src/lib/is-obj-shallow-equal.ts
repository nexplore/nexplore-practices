/**
 * Compares two objects, comparing each properties one by one shallowly. The comparision will only go one level deep, NOT recursive.
 *
 * There are special cases for some propery types:
 * - If the property is a function, it will be ignored.
 * - If the property is an Error, it will be compared by its message.
 * - If the property is a Date, it will be compared by its timestamp.
 *
 * @param obj1 The first object to compare.
 * @param obj2 The second object to compare.
 * @param propertyFilter A function that can be used to filter out properties that should not be compared. If the function returns `false`, the property will be ignored.
 * @param customComparator A optional function that will be called for each key, which can be used to compare properties that are not supported by default. If the function returns `undefined`, the default comparison will be used.
 * @returns `true` if the objects are equal, `false` otherwise.
 */
export function isObjShallowEqual(
    obj1: any,
    obj2: any,
    propertyFilter?: (key: string) => boolean,
    customComparator?: (value1: any, value2: any, key: string) => boolean | undefined
): boolean {
    if (obj1 === obj2) {
        return true;
    }

    if (!obj1 || !obj2) {
        return false;
    }

    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
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
                (typeof propertyFilter === 'function' && !propertyFilter(key))
            ) {
                continue;
            }

            const customEquals = customComparator?.(obj1[key], obj2[key], key);
            if (customEquals !== undefined) {
                if (!customEquals) {
                    return false;
                }
                continue;
            }

            if (obj1[key] !== obj2[key]) {
                if (obj1[key] instanceof Error && obj2[key] instanceof Error) {
                    const errorEquals = obj1[key].message === obj2[key].message;
                    if (!errorEquals) {
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
