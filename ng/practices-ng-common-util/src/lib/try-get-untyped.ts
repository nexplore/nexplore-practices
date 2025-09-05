/**
 * Safely accesses a property from an object that may be null or undefined.
 *
 * @param value The object from which to retrieve the property.
 * @param key The property key to access.
 * @returns The value of the property, or undefined if the object is null or undefined.
 */
export function tryGetUntyped<T>(value: any, key: string): T | undefined {
    return value?.[key] as T;
}
