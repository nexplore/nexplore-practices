import { Injector, signal, untracked, WritableSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type { AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
    applyEach,
    debounce,
    disabled,
    form,
    hidden,
    MAX,
    MAX_LENGTH,
    MAX_NUMBER,
    metadata,
    MIN,
    MIN_LENGTH,
    MIN_NUMBER,
    PATTERN,
    readonly,
    REQUIRED,
    validate,
    validateAsync,
    validateTree,
    type FieldTree,
    type ValidationError,
} from '@angular/forms/signals';
import { forkJoin, from, Observable } from 'rxjs';
import { AnyDef, ArrayDef, ControlDef, GroupDef } from '../definition';
import { initialValueOfDef } from '../definition-utils';
import { fromValidationErrors, PuiValidationError } from '../error-model';
import { AnyNode, createNode, FormRuntime, SignalFormGroup } from '../nodes/nodes';
import {
    getValidatorSpec,
    resolveAsyncValidatorsOfResult,
    resolveValidatorsOfResult,
    unwrapForm,
} from '../validation/validators';
import { NODE_STATE } from './node-state';
import { patternOf, RuleRegistry } from './rule-registry';
import { trackingValues } from './tracking-values';

type Ctx = { pathKeys: () => readonly string[]; value: () => any; state: any; fieldTree: any };

function join(parent: string, key: string): string {
    return parent ? `${parent}.${key}` : key;
}

/**
 * Owns everything a signal form needs: the model signal, the signal form tree built from the static schema,
 * the rule registry the schema reads from, and the root node facade.
 */
export class SignalFormRuntime implements FormRuntime {
    readonly registry = new RuleRegistry();
    readonly model: WritableSignal<any>;
    readonly root: FieldTree<any>;
    readonly rootNode: SignalFormGroup<any>;
    private readonly itemDefs = new Map<string, AnyDef>();

    constructor(readonly injector: Injector, private readonly rootDef: GroupDef<any>) {
        this.registerDefinition(rootDef, '');
        this.model = signal(this.initialModel(rootDef));
        this.root = form(this.model, (path: any) => this.buildSchema(path, rootDef), { injector });
        this.rootNode = createNode(this, [], null, rootDef) as SignalFormGroup<any>;
    }

    private initialModel(def: GroupDef<any>): any {
        return initialValueOfDef(def);
    }

    defAt(keys: readonly string[]): AnyDef | undefined {
        let def: AnyDef | undefined = this.rootDef;
        for (let i = 0; i < keys.length && def; i++) {
            if (def instanceof GroupDef) {
                def = def.controls[keys[i]];
            } else if (def instanceof ArrayDef) {
                def = this.itemDefOf(keys.slice(0, i));
            } else {
                return undefined;
            }
        }
        return def;
    }

    itemDefOf(arrayKeys: readonly string[]): AnyDef | undefined {
        return this.itemDefs.get(patternOf(arrayKeys));
    }

    registerItemDef(arrayKeys: readonly string[], def: AnyDef): void {
        const pattern = patternOf(arrayKeys);
        if (!this.itemDefs.has(pattern)) {
            this.itemDefs.set(pattern, def);
            this.registerDefinition(def, join(pattern, '*'));
        }
    }

    /** Registers a definition added after creation (dynamic definition). */
    registerAddedControl(parentPattern: string, key: string, def: AnyDef): void {
        this.registerDefinition(def, join(parentPattern, key));
    }

    nodeAt(keys: readonly string[]): AnyNode | undefined {
        return keys.length ? this.rootNode.get(keys) ?? undefined : this.rootNode;
    }

    // ---- registration of the validators given by the definition

    private registerDefinition(def: AnyDef, pattern: string): void {
        this.registry.add(pattern, ...def.options.validators);
        this.registry.addAsync(pattern, ...def.options.asyncValidators);
        if (def instanceof GroupDef) {
            for (const [key, child] of Object.entries(def.controls)) {
                this.registerDefinition(child as AnyDef, join(pattern, key));
            }
        } else if (def instanceof ArrayDef && def.items.length) {
            this.itemDefs.set(pattern, def.items[0]);
            this.registerDefinition(def.items[0], join(pattern, '*'));
        }
    }

    // ---- the static schema

    private buildSchema(root: any, rootDef: GroupDef<any>): void {
        this.nodeRules(root);
        this.applyChildren(root, rootDef);
    }

    private applyChildren(path: any, def: GroupDef<any> | ArrayDef<any>): void {
        if (def instanceof GroupDef) {
            applyEach(path, (child: any) => this.nodeRules(child));
            for (const [key, childDef] of Object.entries(def.controls) as [string, AnyDef][]) {
                if (childDef instanceof ControlDef && childDef.options.updateOn === 'blur') {
                    debounce(path[key], 'blur');
                }
                if (childDef instanceof GroupDef || childDef instanceof ArrayDef) {
                    this.applyChildren(path[key], childDef);
                }
            }
        } else {
            const template = def.items[0];
            applyEach(path, (item: any) => {
                this.nodeRules(item);
                if (template instanceof ControlDef && template.options.updateOn === 'blur') {
                    debounce(item, 'blur');
                }
                if (template instanceof GroupDef || template instanceof ArrayDef) {
                    this.applyChildren(item, template);
                }
            });
        }
    }

    /** Rules applied to every field; they read the registry and the per-field state, so they stay dynamic. */
    private nodeRules(p: any): void {
        const registry = this.registry;
        const pattern = (ctx: Ctx) => patternOf(ctx.pathKeys());

        metadata(p, NODE_STATE, () => true);

        disabled(p, (ctx: Ctx) => {
            const override = ctx.state.metadata(NODE_STATE)?.disabled();
            if (override !== undefined) {
                return override;
            }
            return this.defAt(untracked(ctx.pathKeys))?.options.disabled ?? false;
        });
        readonly(p, (ctx: Ctx) => ctx.state.metadata(NODE_STATE)?.readonly() ?? false);
        hidden(p, (ctx: Ctx) => ctx.state.metadata(NODE_STATE)?.hidden() ?? false);

        metadata(p, REQUIRED, ((ctx: Ctx) => !!registry.metaFor(pattern(ctx)).required) as any);
        metadata(p, MIN, (() => MIN_NUMBER) as any);
        metadata(p, MAX, (() => MAX_NUMBER) as any);
        metadata(p, MIN_NUMBER, ((ctx: Ctx) => registry.metaFor(pattern(ctx)).min) as any);
        metadata(p, MAX_NUMBER, ((ctx: Ctx) => registry.metaFor(pattern(ctx)).max) as any);
        metadata(p, MIN_LENGTH, ((ctx: Ctx) => registry.metaFor(pattern(ctx)).minLength) as any);
        metadata(p, MAX_LENGTH, ((ctx: Ctx) => registry.metaFor(pattern(ctx)).maxLength) as any);
        metadata(p, PATTERN, ((ctx: Ctx) => registry.metaFor(pattern(ctx)).pattern) as any);

        validate(p, ((ctx: Ctx) => this.syncErrors(ctx)) as any);
        validateTree(p, ((ctx: Ctx) => this.multiFieldErrors(ctx)) as any);

        validateAsync(p, {
            params: (ctx: Ctx) => {
                const fns = this.asyncValidatorsOf(pattern(ctx));
                return fns.length ? { value: ctx.value(), fns, keys: untracked(ctx.pathKeys) } : undefined;
            },
            factory: (params: any) =>
                rxResource({
                    params,
                    stream: ({ params }: { params: unknown }) => this.runAsync(params as AsyncParams),
                }),
            onSuccess: (results: unknown) => fromValidationErrors(results as ValidationErrors | null) as any,
            onError: (error: unknown) => new PuiValidationError('asyncValidatorError', error) as any,
        } as any);
    }

    private syncErrors(ctx: Ctx): ValidationError.WithoutFieldTree[] | undefined {
        const keys = ctx.pathKeys();
        const node = this.nodeAt(keys);
        if (!node) {
            return undefined;
        }

        const errors: ValidationError.WithoutFieldTree[] = [];

        const manual = ctx.state.metadata(NODE_STATE)?.manualErrors();
        if (manual && Object.is(manual.forValue, ctx.value())) {
            errors.push(...fromValidationErrors(manual.errors));
        }

        for (const { fn, spec } of this.registry.syncFor(patternOf(keys))) {
            let validators: ValidatorFn[];
            switch (spec?.type) {
                case 'conditional':
                    validators = resolveValidatorsOfResult(spec.compute());
                    break;
                case 'dependent':
                    validators = resolveValidatorsOfResult(spec.compute(unwrapForm(spec.form).getRawValue()));
                    break;
                case 'multi':
                    continue; // handled by the tree validation of the group
                default:
                    validators = [fn];
            }
            for (const validator of validators) {
                errors.push(...fromValidationErrors(validator(node as any)));
            }
        }

        return errors.length ? errors : undefined;
    }

    private multiFieldErrors(ctx: Ctx): ValidationError.WithOptionalFieldTree[] | undefined {
        const keys = ctx.pathKeys();
        const specs = this.registry
            .syncFor(patternOf(keys))
            .map((e) => e.spec)
            .filter((spec): spec is Extract<typeof spec, { type: 'multi' }> => spec?.type === 'multi');
        if (!specs.length) {
            return undefined;
        }

        const group = this.nodeAt(keys) as SignalFormGroup<any> | undefined;
        if (group?.kind !== 'group') {
            return undefined;
        }

        const errors: ValidationError.WithOptionalFieldTree[] = [];
        for (const spec of specs) {
            const reads = new Set<string>();
            const result = spec.compute(trackingValues(group, reads));
            const targets = spec.controlNames?.length ? spec.controlNames : [...reads];
            const validators = resolveValidatorsOfResult(result);
            for (const target of targets) {
                const node = group.get(target);
                if (!node) {
                    continue;
                }
                const fieldTree = target.split('.').reduce((tree: any, key) => tree?.[key], ctx.fieldTree);
                for (const validator of validators) {
                    for (const error of fromValidationErrors(validator(node as any))) {
                        errors.push(Object.assign(Object.create(Object.getPrototypeOf(error)), error, { fieldTree }));
                    }
                }
            }
        }
        return errors.length ? errors : undefined;
    }

    private asyncValidatorsOf(pattern: string): AsyncValidatorFn[] {
        return this.registry.asyncFor(pattern).flatMap((entry) => {
            const spec = getValidatorSpec(entry);
            return spec?.type === 'asyncConditional'
                ? resolveAsyncValidatorsOfResult(spec.compute())
                : [entry as AsyncValidatorFn];
        });
    }

    private runAsync(params: AsyncParams): Observable<ValidationErrors | null> {
        const node = this.nodeAt(params.keys);
        // The validators see the value that is validated, even if the form changed in the meantime.
        const control = new Proxy(node as object, {
            get: (target, prop) =>
                prop === 'value' || prop === 'rawValue' ? params.value : Reflect.get(target, prop, target),
        });
        return forkJoin(
            params.fns.map((fn) => {
                const result = fn(control as any);
                return result instanceof Observable ? result : from(result);
            })
        ).pipe(
            // like Angular, merge the errors of all async validators
            (source) =>
                new Observable<ValidationErrors | null>((subscriber) =>
                    source.subscribe({
                        next: (results) => {
                            const merged = results.reduce<ValidationErrors>((acc, r) => ({ ...acc, ...(r ?? {}) }), {});
                            subscriber.next(Object.keys(merged).length ? merged : null);
                        },
                        error: (e) => subscriber.error(e),
                        complete: () => subscriber.complete(),
                    })
                )
        );
    }
}

type AsyncParams = { value: unknown; fns: AsyncValidatorFn[]; keys: readonly string[] };
