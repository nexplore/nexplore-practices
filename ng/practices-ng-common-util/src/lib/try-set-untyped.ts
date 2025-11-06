/**
 * Safely sets a property on an object, only if the object exists.
 *
 * @param value The object on which to set the property.
 * @param key The property key to set.
 * @param newValue The new value to set for the property.
 */
export function trySetUntyped<T>(value: any, key: string, newValue: T): void {
    if (value) {
        value[key] = newValue;
    }
}
