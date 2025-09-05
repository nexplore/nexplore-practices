import { Type } from '@angular/core';
import { INswagGeneratedType, PartialNullable } from './form.types';

/**
 * Check if the provided object represents an NSwag generated type.
 * @param instance The object to check.
 */
export function isDto<T extends INswagGeneratedType = INswagGeneratedType>(
    instance: T | unknown | null
): instance is T {
    return typeof instance === 'object' && !!instance && 'init' in instance;
}

/**
 * Creates a deep clone of the specified value.
 *
 * - If the value is a NSwag generated dto class, a new instance of the dto will be created and all properties will be cloned.
 * - If the value is an array, a new array will be created and all elements will be cloned.
 * - If the value is an object, a new object will be created and all properties will be cloned.
 * - If the value is a `File`, the same instance will be returned.
 * - Otherwise, the `structuredClone` function will be used to clone the value.
 *
 * DOES NOT support circular references.
 */
export function cloneObjectDeep<T>(value: T): T {
    if (!value) {
        return value;
    } else if (value instanceof Array) {
        return value.map(cloneObjectDeep) as T;
    } else if (value instanceof File) {
        return value as T;
    } else if (isDto(value)) {
        const newInstance = new (value as any).__proto__.constructor();
        const entries = Object.entries(value as object).map(([key, v]) => [key, cloneObjectDeep(v)]);
        entries.forEach(([key, v]) => {
            newInstance[key] = v;
        });
        return newInstance;
    } else if (typeof value === 'object' && (value as any).__proto__ === Object.prototype) {
        const entries = Object.entries(value as object).map(([key, v]) => [key, cloneObjectDeep(v)]);
        return Object.fromEntries(entries);
    } else {
        return structuredClone(value);
    }
}

/**
 * Creates a deep clone of the specified value using the structured clone algorithm.
 *
 * Supports NSwag generated dto classes, arrays, objects, and other types.
 */
export function cloneDto<T extends INswagGeneratedType>(instance: T): T {
    return cloneObjectDeep(instance);
}

/**
 * Clones the specified dto and returns a new instance with the specified `updateData` patched.
 *
 * Only properties which are not `undefined` will be applied. A deep clone of the value will be used.
 *
 * Expects an NSwag generated dto class.
 *
 * @param dto The dto to clone.
 * @param updateData The data to patch the clone with. Only properties which are not `undefined` will be applied. A deep clone of the value will be used.
 * @returns A new instance of the dto with the specified `updateData` patched.
 */
export function cloneDtoWith<T extends INswagGeneratedType>(dto: T, updateData?: PartialNullable<T>): T {
    const clone = cloneDto(dto);
    Object.entries(updateData ?? {}).forEach(([key, value]) => {
        if (value !== undefined) {
            (clone as any)[key] = cloneObjectDeep(value); // Clone the value to avoid any potential side effects.
        }
    });
    return clone;
}

/**
 * Creates a new instance of the specified dto type and returns it with the specified `updateData` patched.
 *
 * Only properties which are not `undefined` will be applied.
 *
 * Expects an NSwag generated dto class.
 *
 * @param dtoType The dto type to create an instance of.
 * @param updateData The data to patch the new instance with. Only properties which are not `undefined` will be applied.
 * @returns A new instance of the dto type with the specified `updateData` patched.
 */
export function createDtoWith<T extends INswagGeneratedType>(
    dtoType: Type<T>,
    updateData?: PartialNullable<T> | null
): T {
    const instance = new dtoType();
    Object.entries(updateData ?? {}).forEach(([key, value]) => {
        if (value !== undefined) {
            (instance as any)[key] = value;
        }
    });
    return instance;
}
