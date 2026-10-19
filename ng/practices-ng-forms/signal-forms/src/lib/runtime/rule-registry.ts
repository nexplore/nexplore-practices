import { signal } from '@angular/core';
import type { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { getValidatorSpec, NativeRuleMeta, ValidatorSpec } from '../validation/validators';

export type RegistryEntry = { fn: ValidatorFn; spec?: ValidatorSpec };
type AsyncEntry = AsyncValidatorFn | ValidatorFn;

const EMPTY: readonly never[] = [];

/**
 * Normalizes the keys of a field into the pattern used to look up rules:
 * array indexes become `*`, so `items.2.name` is looked up as `items.*.name`.
 */
export function patternOf(keys: ReadonlyArray<string | number>): string {
    return keys.map((key) => (typeof key === 'number' || /^\d+$/.test(key) ? '*' : key)).join('.');
}

/**
 * Reactive store of the validators that apply to each field of a form, keyed by the field pattern.
 *
 * The signal form schema is static, but it reads this registry from its logic functions, so adding or
 * removing validators later (`withValidation`, `addValidators`, ...) re-evaluates the affected validation logic.
 */
export class RuleRegistry {
    private readonly _sync = signal<ReadonlyMap<string, readonly RegistryEntry[]>>(new Map());
    private readonly _async = signal<ReadonlyMap<string, readonly AsyncEntry[]>>(new Map());

    syncFor(pattern: string): readonly RegistryEntry[] {
        return this._sync().get(pattern) ?? EMPTY;
    }

    asyncFor(pattern: string): readonly AsyncEntry[] {
        return this._async().get(pattern) ?? EMPTY;
    }

    /** Aggregated native rule metadata (required, min, ...) of the validators registered for a pattern. */
    metaFor(pattern: string): NativeRuleMeta {
        const meta: NativeRuleMeta = {};
        for (const { spec } of this.syncFor(pattern)) {
            if (spec?.type !== 'native') {
                continue;
            }
            const m = spec.meta;
            if (m.required) meta.required = true;
            if (m.min !== undefined) meta.min = Math.max(meta.min ?? m.min, m.min);
            if (m.max !== undefined) meta.max = Math.min(meta.max ?? m.max, m.max);
            if (m.minLength !== undefined) meta.minLength = Math.max(meta.minLength ?? m.minLength, m.minLength);
            if (m.maxLength !== undefined) meta.maxLength = Math.min(meta.maxLength ?? m.maxLength, m.maxLength);
            if (m.pattern) meta.pattern = m.pattern;
        }
        return meta;
    }

    has(pattern: string, fn: ValidatorFn): boolean {
        return this.syncFor(pattern).some((e) => e.fn === fn) || this.asyncFor(pattern).includes(fn);
    }

    /** Adds validators; async-flavored specs (`async`, `asyncConditional`) go to the async list. */
    add(pattern: string, ...fns: ValidatorFn[]): void {
        const sync = [...(this._sync().get(pattern) ?? [])];
        let syncChanged = false;
        for (const fn of fns) {
            if (this.has(pattern, fn)) {
                continue;
            }
            const spec = getValidatorSpec(fn);
            if (spec?.type === 'asyncConditional') {
                this.addAsync(pattern, fn);
            } else {
                sync.push({ fn, spec });
                syncChanged = true;
            }
        }
        if (syncChanged) {
            this._sync.update((map) => new Map(map).set(pattern, sync));
        }
    }

    addAsync(pattern: string, ...fns: AsyncEntry[]): void {
        const list = [...(this._async().get(pattern) ?? [])];
        const added = fns.filter((fn) => !list.includes(fn));
        if (added.length) {
            this._async.update((map) => new Map(map).set(pattern, [...list, ...added]));
        }
    }

    remove(pattern: string, ...fns: ValidatorFn[]): void {
        const sync = (this._sync().get(pattern) ?? []).filter((e) => !fns.includes(e.fn));
        if (sync.length !== (this._sync().get(pattern) ?? []).length) {
            this._sync.update((map) => new Map(map).set(pattern, sync));
        }
        const asyncList = (this._async().get(pattern) ?? []).filter((e) => !fns.includes(e));
        if (asyncList.length !== (this._async().get(pattern) ?? []).length) {
            this._async.update((map) => new Map(map).set(pattern, asyncList));
        }
    }

    removeAsync(pattern: string, ...fns: AsyncValidatorFn[]): void {
        const list = (this._async().get(pattern) ?? []).filter((e) => !fns.includes(e as AsyncValidatorFn));
        this._async.update((map) => new Map(map).set(pattern, list));
    }

    clear(pattern: string): void {
        this._sync.update((map) => new Map(map).set(pattern, []));
        this._async.update((map) => new Map(map).set(pattern, []));
    }
}
