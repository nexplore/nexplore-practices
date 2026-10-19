import { computed, EffectRef, Injector, runInInjectionContext, Signal, untracked } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import type { AsyncValidatorFn, FormControlStatus, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
    type FieldState,
    type FieldTree,
    submit as signalFormSubmit,
    type FormSubmitOptions,
    type TreeValidationResult,
    type ValidationError,
} from '@angular/forms/signals';
import { defer, distinctUntilChanged, Observable, skipWhile } from 'rxjs';
import { AnyDef, ArrayDef, ControlDef, GroupDef, isDef } from '../definition';
import { initialValueOfDef, resetValueOfDef } from '../definition-utils';
import { PuiValidationError, toValidationErrors } from '../error-model';
import { NODE_STATE, NodeState } from '../runtime/node-state';
import type { ConditionalValidatorResult, BoundValidators, ValidatorDefinition } from '../validation/validation-types';
import type { DeepKeyOfFormGroup } from '../types';
import { extendWithEffect } from '../form-group-fluent-builder/with-effect';
import { extendWithMultiFieldValidation } from '../form-group-fluent-builder/with-validation-multi-field';
import { extendWithResetFromSignal, ResetWithSignalConfig } from '../form-group-fluent-builder/with-reset-from-signal';
import { extendWithValidation } from '../form-group-fluent-builder/with-validation';
import { extendWithValueChangeEffect } from '../form-group-fluent-builder/with-value-change-effect';
import type { RuleRegistry } from '../runtime/rule-registry';
import { patternOf } from '../runtime/rule-registry';

/** What the nodes need from the form they belong to. @internal */
export interface FormRuntime {
    readonly injector: Injector;
    readonly root: FieldTree<any>;
    readonly registry: RuleRegistry;
    /** The definition of the field at the given keys. */
    defAt(keys: readonly string[]): AnyDef | undefined;
    /** The definition used for new items of the array at the given keys. */
    itemDefOf(arrayKeys: readonly string[]): AnyDef | undefined;
    /** Registers a definition (and its validators) for a newly created item. */
    registerItemDef(arrayKeys: readonly string[], def: AnyDef): void;
}

/** Any node, regardless of its value type. */
export type AnyNode = SignalFormNode<unknown>;

export type NodeValue<TNode> = TNode extends SignalFormNode<infer TValue> ? TValue : never;
export type ControlsValues<TControls> = { [K in keyof TControls]: NodeValue<TControls[K]> };

/** A Signal that additionally exposes one nested Signal per control. */
export type ValueSignalWithChildren<TControls> = Signal<ControlsValues<TControls>> & {
    readonly [K in keyof TControls]: Signal<NodeValue<TControls[K]>>;
};

type Key = string;

/**
 * Base of all nodes: a facade over one field of the signal form tree.
 *
 * The facade owns no state of its own. Value, validity, errors, touched, dirty, pending, disabled and readonly all
 * live in the signal form tree; the getters here only read that state (so they are tracked when used in a reactive context)
 * and the methods write to it.
 */
export abstract class SignalFormNode<TValue = unknown> {
    abstract readonly kind: 'control' | 'group' | 'array';

    private readonly _signals = new Map<string, Signal<any>>();
    private _valueChanges?: Observable<TValue>;
    private _statusChanges?: Observable<FormControlStatus>;

    /** @internal */
    constructor(
        /** @internal */ readonly runtime: FormRuntime,
        /** The keys that lead from the root to this node. */
        readonly pathKeys: readonly Key[],
        /** @internal */ readonly parentNode: SignalFormGroup<any> | SignalFormArray<any> | null
    ) {}

    /** The underlying signal forms field tree of this node. Bind it with the `[formField]` directive. */
    get fieldTree(): FieldTree<TValue> {
        let tree: any = this.runtime.root;
        for (const key of this.pathKeys) {
            tree = tree?.[key];
        }
        return tree as FieldTree<TValue>;
    }

    /** Alias of `fieldTree`. */
    get field(): FieldTree<TValue> {
        return this.fieldTree;
    }

    /** The state of the underlying signal forms field. */
    get fieldState(): FieldState<TValue> {
        return this.fieldTree();
    }

    get parent(): SignalFormGroup<any> | SignalFormArray<any> | null {
        return this.parentNode;
    }

    get root(): AnyNode {
        return this.parentNode ? this.parentNode.root : this;
    }

    get injector(): Injector {
        return this.runtime.injector;
    }

    /** @internal */
    get def(): AnyDef | undefined {
        return this.runtime.defAt(this.pathKeys);
    }

    private get nodeState(): NodeState {
        return this.fieldState.metadata(NODE_STATE)!;
    }

    // ---- value

    /** The value without disabled controls (like `AbstractControl.value`). */
    abstract get value(): TValue;

    /** The value including disabled controls (like `AbstractControl.getRawValue()`). */
    get rawValue(): TValue {
        return this.fieldState.value();
    }

    getRawValue(): TValue {
        return this.rawValue;
    }

    abstract setValue(value: TValue): void;
    abstract patchValue(value: unknown): void;

    /**
     * Resets the node: the value becomes the given value (or the default value of the controls: the initial value for
     * non-nullable, `null` for nullable ones), and touched and dirty are cleared.
     */
    reset(value?: unknown): void {
        const def = this.def;
        const next = def
            ? resetValueOfDef(def, value, (arrayDef) => this.runtime.itemDefOf(this.pathKeys) ?? arrayDef.items[0])
            : value;
        this.fieldState.reset(next as TValue);
    }

    // ---- state

    get status(): FormControlStatus {
        if (this.disabled) {
            return 'DISABLED';
        }
        const state = this.fieldState;
        return state.invalid() ? 'INVALID' : state.pending() ? 'PENDING' : 'VALID';
    }

    get valid(): boolean {
        return this.status === 'VALID';
    }

    get invalid(): boolean {
        return this.status === 'INVALID';
    }

    get pending(): boolean {
        return this.status === 'PENDING';
    }

    get disabled(): boolean {
        return this.fieldState.disabled();
    }

    get enabled(): boolean {
        return !this.disabled;
    }

    get readonly(): boolean {
        return this.fieldState.readonly();
    }

    get hidden(): boolean {
        return this.fieldState.hidden();
    }

    get dirty(): boolean {
        return this.fieldState.dirty();
    }

    get pristine(): boolean {
        return !this.dirty;
    }

    get touched(): boolean {
        return this.fieldState.touched();
    }

    get untouched(): boolean {
        return !this.touched;
    }

    /** `true` while the form this node belongs to is being submitted. */
    get submitting(): boolean {
        return this.fieldState.submitting();
    }

    /**
     * The errors of this node as `ValidationErrors` record (see the error model in the README), `null` if there are none.
     * Errors of descendants are not included (use `combineDirectiveControlErrors` for that).
     */
    get errors(): ValidationErrors | null {
        return toValidationErrors(this.fieldState.errors(), this.rawValue);
    }

    /** The signal forms errors of this node (with messages and target field tree). */
    get errorList(): ValidationError.WithFieldTree[] {
        return this.fieldState.errors();
    }

    /** The signal forms errors of this node and all of its descendants. */
    get errorSummary(): ValidationError.WithFieldTree[] {
        return this.fieldState.errorSummary();
    }

    hasError(errorCode: string, path?: ReadonlyArray<string | number> | string): boolean {
        return !!this.getError(errorCode, path);
    }

    getError(errorCode: string, path?: ReadonlyArray<string | number> | string): any {
        const target = path === undefined ? this : this.get(path);
        return target?.errors?.[errorCode] ?? null;
    }

    /** Returns the descendant at the given path (`'address.street'`, `['items', 0, 'name']`). */
    get(path: ReadonlyArray<string | number> | string): AnyNode | null {
        const keys = Array.isArray(path) ? path.map(String) : String(path).split('.');
        let node: AnyNode | null | undefined = this;
        for (const key of keys) {
            node = node.kind === 'group' ? (node as unknown as SignalFormGroup<any>).controls[key] : node.kind === 'array' ? (node as unknown as SignalFormArray<any>).at(Number(key)) : null;
            if (!node) {
                return null;
            }
        }
        return node;
    }

    // ---- state changes

    /** Marks this node (not its descendants) as touched. */
    markAsTouched(): void {
        this.fieldState.markAsTouched({ skipDescendants: true });
    }

    /** Marks this node and all its descendants as touched. */
    markAllAsTouched(): void {
        this.fieldState.markAsTouched();
    }

    markAsDirty(): void {
        this.fieldState.markAsDirty();
    }

    /** Marks this node and all its descendants as dirty. */
    markAllAsDirty(): void {
        for (const control of this.controlsDeep()) {
            control.markAsDirty();
        }
        this.markAsDirty();
    }

    /**
     * Marks this node and its descendants as pristine, keeping their touched state.
     * Signal forms only know a combined reset, so the touched state is re-applied afterwards.
     */
    markAsPristine(): void {
        const touched = this.controlsDeep().filter((c) => c.touched);
        const selfTouched = this.touched && this.controlsDeep().length === 0;
        this.fieldState.reset();
        touched.forEach((c) => c.markAsTouched());
        if (selfTouched) {
            this.markAsTouched();
        }
    }

    /**
     * Marks this node and its descendants as untouched, keeping their dirty state.
     * Signal forms only know a combined reset, so the dirty state is re-applied afterwards.
     */
    markAsUntouched(): void {
        const dirty = this.controlsDeep().filter((c) => c.dirty);
        const selfDirty = this.dirty && this.controlsDeep().length === 0;
        this.fieldState.reset();
        dirty.forEach((c) => c.markAsDirty());
        if (selfDirty) {
            this.markAsDirty();
        }
    }

    /** Disables this node and all of its descendants. */
    disable(): void {
        this.nodeState.disabled.set(true);
    }

    /** Enables this node and all of its descendants (also those disabled by their definition). */
    enable(): void {
        this.nodeState.disabled.set(false);
        for (const node of this.nodesDeep()) {
            node.nodeState.disabled.set(false);
        }
    }

    setReadonly(readonly: boolean): void {
        this.nodeState.readonly.set(readonly);
    }

    setHidden(hidden: boolean): void {
        this.nodeState.hidden.set(hidden);
    }

    /**
     * Sets errors manually. They stay until the value of the node changes or `setErrors(null)` is called.
     */
    setErrors(errors: ValidationErrors | null): void {
        this.nodeState.manualErrors.set(errors ? { errors, forValue: untracked(() => this.rawValue) } : null);
    }

    /**
     * Signal forms derive validity, so there is nothing to recompute. Re-runs async validation (`reloadValidation()`).
     */
    updateValueAndValidity(): void {
        this.fieldState.reloadValidation();
    }

    // ---- validators

    private get registryPattern(): string {
        return patternOf(this.pathKeys);
    }

    addValidators(...validators: ValidatorFn[]): void {
        this.runtime.registry.add(this.registryPattern, ...validators);
    }

    removeValidators(...validators: ValidatorFn[]): void {
        this.runtime.registry.remove(this.registryPattern, ...validators);
    }

    hasValidator(validator: ValidatorFn): boolean {
        return this.runtime.registry.has(this.registryPattern, validator);
    }

    setValidators(validators: ValidatorFn | ValidatorFn[] | null): void {
        this.clearValidators();
        this.addValidators(...(validators == null ? [] : Array.isArray(validators) ? validators : [validators]));
    }

    clearValidators(): void {
        this.runtime.registry.clear(this.registryPattern);
    }

    addAsyncValidators(...validators: AsyncValidatorFn[]): void {
        this.runtime.registry.addAsync(this.registryPattern, ...validators);
    }

    removeAsyncValidators(...validators: AsyncValidatorFn[]): void {
        this.runtime.registry.removeAsync(this.registryPattern, ...validators);
    }

    hasAsyncValidator(validator: AsyncValidatorFn): boolean {
        return untracked(() => this.runtime.registry.asyncFor(this.registryPattern).includes(validator));
    }

    // ---- signals and observables

    /** Creates (once) and returns a signal computed from this node. */
    protected cached<T>(name: string, factory: () => T): Signal<T> {
        let sig = this._signals.get(name);
        if (!sig) {
            sig = computed(factory);
            this._signals.set(name, sig);
        }
        return sig;
    }

    get valueSignal(): Signal<TValue> {
        return this.cached('value', () => this.value);
    }

    get rawValueSignal(): Signal<TValue> {
        return this.cached('rawValue', () => this.rawValue);
    }

    get statusSignal(): Signal<FormControlStatus> {
        return this.cached('status', () => this.status);
    }

    get dirtySignal(): Signal<boolean> {
        return this.cached('dirty', () => this.dirty);
    }

    get pristineSignal(): Signal<boolean> {
        return this.cached('pristine', () => this.pristine);
    }

    get touchedSignal(): Signal<boolean> {
        return this.cached('touched', () => this.touched);
    }

    get untouchedSignal(): Signal<boolean> {
        return this.cached('untouched', () => this.untouched);
    }

    get validSignal(): Signal<boolean> {
        return this.cached('valid', () => this.valid);
    }

    get invalidSignal(): Signal<boolean> {
        return this.cached('invalid', () => this.invalid);
    }

    get pendingSignal(): Signal<boolean> {
        return this.cached('pending', () => this.pending);
    }

    get disabledSignal(): Signal<boolean> {
        return this.cached('disabled', () => this.disabled);
    }

    get enabledSignal(): Signal<boolean> {
        return this.cached('enabled', () => this.enabled);
    }

    get readonlySignal(): Signal<boolean> {
        return this.cached('readonly', () => this.readonly);
    }

    get submittingSignal(): Signal<boolean> {
        return this.cached('submitting', () => this.submitting);
    }

    get errorsSignal(): Signal<ValidationErrors | null> {
        return this.cached('errors', () => this.errors);
    }

    /**
     * Emits whenever the value changes (not for the initial value).
     * In contrast to Reactive Forms, emissions are driven by effects: changes made within the same tick are coalesced
     * and emitted when effects flush.
     */
    get valueChanges(): Observable<TValue> {
        return (this._valueChanges ??= this.toChanges(this.valueSignal));
    }

    /** Emits whenever the status changes (not for the initial status), see `valueChanges` for timing. */
    get statusChanges(): Observable<FormControlStatus> {
        return (this._statusChanges ??= this.toChanges(this.statusSignal));
    }

    private toChanges<T>(source: Signal<T>): Observable<T> {
        const shared = runInInjectionContext(this.runtime.injector, () =>
            toObservable(source, { injector: this.runtime.injector })
        );
        // The baseline is the value at subscription time, so changes made before the first effect run are not lost.
        return defer(() => {
            const initial = untracked(source);
            return shared.pipe(
                distinctUntilChanged(),
                skipWhile((value) => Object.is(value, initial))
            );
        });
    }

    // ---- traversal

    /** All leaf controls below this node (or this node if it is a leaf). */
    protected controlsDeep(): AnyNode[] {
        return [];
    }

    /** All nodes below this node. */
    protected nodesDeep(): AnyNode[] {
        return [];
    }
}

/** A leaf node holding a single value (which may itself be an object, like a DTO). */
export class SignalFormControl<TValue = unknown> extends SignalFormNode<TValue> {
    readonly kind = 'control' as const;

    get value(): TValue {
        return this.fieldState.value();
    }

    /** `'blur'` if the control only updates its model on blur. */
    get updateOn(): 'change' | 'blur' | 'submit' {
        const def = this.def;
        return (def instanceof ControlDef && def.options.updateOn) || 'change';
    }

    /** The value as shown in the UI control; differs from `value` while a `blur` update is pending. */
    get controlValue(): TValue {
        return this.fieldState.controlValue();
    }

    setValue(value: TValue): void {
        this.fieldState.value.set(value);
    }

    patchValue(value: TValue): void {
        this.setValue(value);
    }

    protected override controlsDeep(): AnyNode[] {
        return [this];
    }

    protected override nodesDeep(): AnyNode[] {
        return [];
    }
}

/** A node with named children. */
export class SignalFormGroup<TControls extends object = Record<string, AnyNode>> extends SignalFormNode<ControlsValues<TControls>> {
    readonly kind = 'group' as const;
    readonly controls: TControls = {} as TControls;

    /** @internal */
    constructor(runtime: FormRuntime, pathKeys: readonly Key[], parentNode: SignalFormGroup<any> | SignalFormArray<any> | null) {
        super(runtime, pathKeys, parentNode);
    }

    /** @internal Creates (or returns) the child node for a key. */
    ensureControl(key: string, def: AnyDef): AnyNode {
        const existing = (this.controls as Record<string, AnyNode>)[key];
        if (existing) {
            return existing;
        }
        const node = createNode(this.runtime, [...this.pathKeys, key], this as any, def);
        (this.controls as Record<string, AnyNode>)[key] = node;
        return node;
    }

    contains(controlName: string): boolean {
        return controlName in this.controls && (this.controls as any)[controlName].enabled;
    }

    override get disabled(): boolean {
        const children = Object.values(this.controls) as AnyNode[];
        return super.disabled || (children.length > 0 && children.every((c) => c.disabled));
    }

    get value(): ControlsValues<TControls> {
        return this.valueSignal();
    }

    override get valueSignal(): ValueSignalWithChildren<TControls> {
        return this.withChildSignals(this.cached('value', () => this.computeValue()), 'valueSignal');
    }

    override get rawValueSignal(): ValueSignalWithChildren<TControls> {
        return this.withChildSignals(this.cached('rawValue', () => this.rawValue), 'rawValueSignal');
    }

    private computeValue(): ControlsValues<TControls> {
        const result: Record<string, unknown> = {};
        const includeAll = this.disabled;
        for (const [key, control] of Object.entries(this.controls) as [string, AnyNode][]) {
            if (includeAll || control.enabled) {
                result[key] = control.value;
            }
        }
        return result as ControlsValues<TControls>;
    }

    /**
     * Makes a value signal usable as a record of the signals of its controls:
     * `valueSignal()` is the group value, `valueSignal.name()` the value of the control `name`.
     */
    private withChildSignals(signal: Signal<any>, property: 'valueSignal' | 'rawValueSignal'): ValueSignalWithChildren<TControls> {
        return new Proxy(signal, {
            get: (target, prop, receiver) => {
                if (typeof prop === 'string' && prop in this.controls) {
                    return (this.controls as Record<string, AnyNode>)[prop][property];
                }
                return Reflect.get(target, prop, receiver);
            },
            has: (target, prop) => (typeof prop === 'string' && prop in this.controls) || Reflect.has(target, prop),
        }) as ValueSignalWithChildren<TControls>;
    }

    setValue(value: ControlsValues<TControls>): void {
        for (const key of Object.keys(this.controls)) {
            if (!value || !(key in (value as object))) {
                throw new Error(`Must supply a value for form control with name: '${key}'.`);
            }
        }
        this.patchValue(value);
    }

    patchValue(value: Partial<{ [K in keyof TControls]: unknown }> | null | undefined): void {
        if (value == null) {
            return;
        }
        for (const [key, childValue] of Object.entries(value)) {
            (this.controls as Record<string, AnyNode>)[key]?.patchValue(childValue);
        }
    }

    protected override controlsDeep(): AnyNode[] {
        return (Object.values(this.controls) as AnyNode[]).flatMap((c) =>
            (c as AnyNode).kind === 'control' ? [c as AnyNode] : (c as any).controlsDeep()
        );
    }

    protected override nodesDeep(): AnyNode[] {
        return (Object.values(this.controls) as AnyNode[]).flatMap((c) => [c, ...(c as any).nodesDeep()]);
    }

    // ---- fluent extensions

    /** Adds validators to the controls, see `extendWithValidation`. */
    withValidation(
        validatorDefinitions:
            | ValidatorDefinition<TControls>
            | ((validators: BoundValidators<SignalFormGroup<TControls>>) => ValidatorDefinition<TControls>)
    ): this {
        return extendWithValidation.call(this as any, validatorDefinitions as any) as this;
    }

    /** Adds a validation that spans multiple fields, see `extendWithMultiFieldValidation`. */
    withMultiFieldValidation(
        validator: (formValues: ControlsValues<TControls>) => ConditionalValidatorResult,
        controlNames?: Array<DeepKeyOfFormGroup<SignalFormGroup<TControls>>>
    ): this {
        return extendWithMultiFieldValidation.call(this as any, validator as any, controlNames as any) as this;
    }

    /** Runs an effect when the values it reads change, see `extendWithValueChangeEffect`. */
    withValueChangeEffect(effectFn: (value: ControlsValues<TControls>) => void, options?: { debounceTime?: number }): this {
        return extendWithValueChangeEffect.call(this as any, effectFn as any, options) as this;
    }

    /** Runs an effect with the form as argument, see `extendWithEffect`. */
    withEffect(effectRefOrFn: EffectRef | ((form: SignalFormGroup<TControls>) => void)): this {
        return extendWithEffect.call(this as any, effectRefOrFn as any) as this;
    }

    /** Resets the form when the signal changes, see `extendWithResetFromSignal`. */
    withResetFromSignal<TSignalValue extends object>(
        dtoSignal: Signal<TSignalValue | null | undefined>,
        config?: ResetWithSignalConfig<TSignalValue, ControlsValues<TControls>>
    ): this {
        return extendWithResetFromSignal.call(this as any, dtoSignal, config as any) as this;
    }

    /** Names of the controls that have been added to the group. */
    get controlNames(): string[] {
        return Object.keys(this.controls);
    }

    /**
     * Submits the form, using the signal forms submission:
     * - touches all fields
     * - if the form is valid (pending validators do not block unless `ignoreValidators: 'none'`), runs `action`
     *   while `submitting` is `true`
     * - errors returned from the action are set on the targeted fields as server errors (use `serverError(...)`)
     *
     * Resolves with `true` if the action ran and returned no errors.
     */
    submit(
        action: (value: ControlsValues<TControls>, form: SignalFormGroup<TControls>) => Promise<TreeValidationResult> | Promise<void>,
        options?: Pick<FormSubmitOptions<unknown, unknown>, 'ignoreValidators'> & {
            onInvalid?: (form: SignalFormGroup<TControls>) => void;
        }
    ): Promise<boolean> {
        return signalFormSubmit(this.fieldTree as FieldTree<any>, {
            action: async () => (await action(untracked(() => this.value), this)) as TreeValidationResult,
            onInvalid: options?.onInvalid ? () => options.onInvalid!(this) : undefined,
            ignoreValidators: options?.ignoreValidators,
        });
    }
}

/** A node holding a list of items. */
export class SignalFormArray<TItem extends object = AnyNode> extends SignalFormNode<NodeValue<TItem>[]> {
    readonly kind = 'array' as const;
    private readonly _items = new Map<number, TItem>();

    get length(): number {
        return this.fieldState.value().length;
    }

    /** The item nodes (one per current model item). */
    get controls(): TItem[] {
        return Array.from({ length: this.length }, (_, index) => this.at(index)!);
    }

    at(index: number): TItem | undefined {
        if (index < 0 || index >= untracked(() => this.length)) {
            return undefined;
        }
        let node = this._items.get(index);
        if (!node) {
            const def = this.runtime.itemDefOf(this.pathKeys);
            node = createNode(this.runtime, [...this.pathKeys, String(index)], this as any, def ?? new ControlDef(null)) as TItem;
            this._items.set(index, node);
        }
        return node;
    }

    get value(): NodeValue<TItem>[] {
        return this.valueSignal();
    }

    override get valueSignal(): Signal<NodeValue<TItem>[]> {
        return this.cached('value', () => (this.controls as unknown as AnyNode[]).filter((c) => this.disabled || c.enabled).map((c) => c.value as NodeValue<TItem>));
    }

    override get disabled(): boolean {
        const items = this.controls as unknown as AnyNode[];
        return super.disabled || (items.length > 0 && items.every((c) => c.disabled));
    }

    /** Builds the model value for an item from a value or a definition. */
    private itemValue(valueOrDef: unknown): unknown {
        if (isDef(valueOrDef)) {
            this.runtime.registerItemDef(this.pathKeys, valueOrDef);
            return initialValueOfDef(valueOrDef);
        }
        const template = this.runtime.itemDefOf(this.pathKeys);
        if (valueOrDef === undefined && template) {
            return initialValueOfDef(template);
        }
        return valueOrDef === undefined ? null : valueOrDef;
    }

    push(valueOrDef?: unknown): void {
        this.fieldState.value.update((items) => [...items, this.itemValue(valueOrDef) as NodeValue<TItem>]);
    }

    insert(index: number, valueOrDef?: unknown): void {
        this.fieldState.value.update((items) => {
            const next = [...items];
            next.splice(index, 0, this.itemValue(valueOrDef) as NodeValue<TItem>);
            return next;
        });
    }

    removeAt(index: number): void {
        this.fieldState.value.update((items) => items.filter((_, i) => i !== index));
    }

    clear(): void {
        this.fieldState.value.set([]);
    }

    setValue(value: NodeValue<TItem>[]): void {
        if (value.length !== this.length) {
            throw new Error(`Must supply a value for form array item at index ${Math.min(value.length, this.length)}.`);
        }
        this.patchValue(value);
    }

    patchValue(value: unknown): void {
        (value as unknown[] | null | undefined)?.forEach((item, index) => (this.at(index) as unknown as AnyNode | undefined)?.patchValue(item));
    }

    protected override controlsDeep(): AnyNode[] {
        return this.controls.flatMap((c) => ((c as AnyNode).kind === 'control' ? [c as AnyNode] : (c as any).controlsDeep()));
    }

    protected override nodesDeep(): AnyNode[] {
        return this.controls.flatMap((c) => [c, ...(c as any).nodesDeep()]);
    }
}

/** @internal */
export function createNode(
    runtime: FormRuntime,
    keys: readonly Key[],
    parent: SignalFormGroup<any> | SignalFormArray<any> | null,
    def: AnyDef
): AnyNode {
    if (def instanceof GroupDef) {
        const group = new SignalFormGroup<any>(runtime, keys, parent as any);
        for (const [key, childDef] of Object.entries(def.controls)) {
            group.ensureControl(key, childDef as AnyDef);
        }
        return group;
    }
    if (def instanceof ArrayDef) {
        return new SignalFormArray<any>(runtime, keys, parent as any);
    }
    return new SignalFormControl<any>(runtime, keys, parent as any);
}

/**
 * Creates a server error that targets a specific node when returned from a `submit` action.
 *
 * ```ts
 * await form.submit(async (value) => serverError(form.controls.email, 'emailTaken'));
 * ```
 */
export function serverError(
    target: AnyNode,
    kind: string,
    payload: unknown = true,
    message?: string
): ValidationError.WithFieldTree {
    const error = new PuiValidationError(kind, payload, message);
    return Object.assign(error, { fieldTree: target.fieldTree }) as unknown as ValidationError.WithFieldTree;
}
