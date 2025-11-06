import { Falsy } from 'rxjs';

export type NotFalseOrNothing<T> = Exclude<T, Falsy>;

export function wrapArrayAndFilterFalsyValues<T>(itemOrItems: T | T[] | null): NotFalseOrNothing<T>[] {
    return itemOrItems !== null
        ? Array.isArray(itemOrItems)
            ? itemOrItems.filter((item): item is NotFalseOrNothing<T> => !!item)
            : !itemOrItems
            ? []
            : ([itemOrItems] as NotFalseOrNothing<T>[])
        : [];
}
