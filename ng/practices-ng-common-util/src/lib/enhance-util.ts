import { isSignal, Signal } from '@angular/core';
import { isObservable, Observable } from 'rxjs';

type Enhancements = Record<string, unknown | PropertyDescriptor>;
type EnhancedObject<T, TE> = T & {
    [TKey in keyof TE]:
    TE[TKey] extends Signal<any> ?    TE[TKey] :
    TE[TKey] extends Observable<any> ? TE[TKey] :
    TE[TKey] extends (...args: any[]) => infer TValue ?  TValue :
    TE[TKey] extends TypedPropertyDescriptor<infer TValue> ? TValue :
    TE[TKey];
}

/**
 * Enhances the specified object with additional members
 *
 * The enhancements can be either a value, a function that returns a value, or a signal.
 *
 * -- The values can be a signal, an observable, or a property descriptor.
 *
 * Manipulates the object reference directly.
 *
 * @param obj The object to enhance
 * @param enhancements The enhancements to apply
 * @returns same reference to the passed in object
 */
export function enhance<T, TEnhancement extends Enhancements>(
    obj: T,
    enhancements: TEnhancement | ((source: T) => TEnhancement)
): EnhancedObject<T, TEnhancement> {
    if (typeof enhancements === 'function') {
        enhancements = enhancements(obj);
    }

    Object.entries(enhancements).forEach(([key, value]) => {
        Object.defineProperty(
            obj,
            key,

            isSignal(value)
                ? {
                    get: () => value,
                    configurable: true,
                }
                : isObservable(value)
                    ? {
                        get: () => value,
                        configurable: true,
                    }
                    : value && typeof value === 'object' && ('get' in value || 'value' in value)
                        ? (value as PropertyDescriptor)
                        : {
                            get: () => value as any,
                            configurable: true,
                        }
        );
    });

    return obj as any;
}
