import { ElementRef } from '@angular/core';
import { setHostClassNames } from '../util/utils';
import { IconDirection } from './icon.interface';

/** Reads item at index of array, however in a circular manner: `circularAccess(['a','b','c'], 3)` returns 'a' */
function circularAccess<T>(arr: Array<T>, i: number) {
    return arr[((i % arr.length) + arr.length) % arr.length];
}

export function applyIconDirection(
    dir: IconDirection,
    defaultDir: IconDirection,
    elementRef: HTMLElement | ElementRef<HTMLElement>
) {
    if (!defaultDir || !dir) {
        setHostClassNames(
            {
                'origin-center': false,
                'rotate-0': false,
                'rotate-90': false,
                'rotate-180': false,
                '-rotate-90': false,
            },
            elementRef
        );
    } else {
        const order = [IconDirection.RIGHT, IconDirection.DOWN, IconDirection.LEFT, IconDirection.UP];
        const start = order.indexOf(defaultDir);
        setHostClassNames(
            {
                'origin-center': true,
                'rotate-0': dir === circularAccess(order, start),
                'rotate-90': dir === circularAccess(order, start + 1),
                'rotate-180': dir === circularAccess(order, start + 2),
                '-rotate-90': dir === circularAccess(order, start + 3),
            },
            elementRef
        );
    }
}
