import type { AnyNode, SignalFormGroup } from '../nodes/nodes';

/**
 * The values of a group as an object whose property reads are tracked by the current reactive context
 * and recorded: every control whose value is read ends up in `reads` (dotted path for nested groups).
 *
 * Nested groups are exposed as nested objects, arrays and controls as their value.
 */
export function trackingValues(group: SignalFormGroup<any>, reads?: Set<string>, prefix = ''): any {
    const controls = group.controls as Record<string, AnyNode>;
    const read = (key: string) => {
        const child = controls[key];
        if (!child) {
            return undefined;
        }
        if (child.kind === 'group') {
            return trackingValues(child as SignalFormGroup<any>, reads, `${prefix}${key}.`);
        }
        reads?.add(`${prefix}${key}`);
        return child.rawValue;
    };
    return new Proxy(
        {},
        {
            get: (_target, key) => (typeof key === 'string' ? read(key) : undefined),
            has: (_target, key) => typeof key === 'string' && key in controls,
            ownKeys: () => Object.keys(controls),
            getOwnPropertyDescriptor: (_target, key) =>
                typeof key === 'string' && key in controls
                    ? { enumerable: true, configurable: true, value: read(key) }
                    : undefined,
        }
    );
}
