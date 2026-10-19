import { EnvironmentInjector, inject, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { createFormGroup as createReactive, formGroup as reactiveFormGroup } from '@nexplore/practices-ng-forms';
import { createFormGroup as createSignal, formGroup as signalFormGroup } from '../src/index';
import { recordParity } from './parity-report';
import type { ParityContext } from './parity-types';
import { SCENARIOS } from './scenarios';

/**
 * Reactive Forms applies `with...()` validation through effects, so the scenarios observe the settled state:
 * after every fluent `with...()` call effects are flushed (a no-op for the signal implementation).
 */
function settled<T extends object>(form: T): T {
    return new Proxy(form, {
        get: (target, prop, receiver) => {
            const value = Reflect.get(target, prop, target);
            if (typeof prop === 'string' && prop.startsWith('with') && typeof value === 'function') {
                return (...args: unknown[]) => {
                    value.apply(target, args);
                    TestBed.tick();
                    return receiver;
                };
            }
            return value;
        },
    });
}

function withSettledExtensions(namespace: any): any {
    return Object.fromEntries(
        Object.entries(namespace).map(([name, fn]) => [
            name,
            (...args: unknown[]) => {
                const result = (fn as Function)(...args);
                return result && typeof result === 'object' && 'controls' in result ? settled(result) : result;
            },
        ])
    );
}

function createContext(implementation: 'reactive' | 'signal', subscriptions: { unsubscribe(): void }[]): ParityContext {
    const injector = TestBed.inject(Injector);
    const settle = async (ms = 20) => {
        await new Promise((resolve) => setTimeout(resolve, ms));
        TestBed.tick();
        await Promise.resolve();
        TestBed.tick();
        await new Promise((resolve) => setTimeout(resolve, 0));
        TestBed.tick();
    };
    return {
        implementation,
        formGroup: withSettledExtensions(implementation === 'reactive' ? reactiveFormGroup : signalFormGroup),
        rawFormGroup: implementation === 'reactive' ? reactiveFormGroup : signalFormGroup,
        createFormGroup: (...args: unknown[]) =>
            settled(((implementation === 'reactive' ? createReactive : createSignal) as any)(...args)),
        injector,
        flush: () => TestBed.tick(),
        settle,
        arrayPush: (array, value, validators) =>
            array.push(implementation === 'reactive' ? new FormControl(value, (validators ?? []) as any) : value),
        collect: <T>(source: Observable<T>) => {
            const emissions: T[] = [];
            subscriptions.push(source.subscribe((value) => emissions.push(value)));
            return emissions;
        },
        submit: async (form, action) => {
            if (implementation === 'reactive') {
                form.markAllAsTouched();
                if (form.invalid) {
                    return false;
                }
                await action(form.value);
                return true;
            }
            return form.submit(async (value: unknown) => {
                await action(value);
            });
        },
        errorsOf: (form, path) => form.get(path)?.errors,
    };
}

async function runScenario(implementation: 'reactive' | 'signal', index: number): Promise<unknown> {
    TestBed.configureTestingModule({});
    const subscriptions: { unsubscribe(): void }[] = [];
    try {
        const ctx = createContext(implementation, subscriptions);
        return await TestBed.runInInjectionContext(async () => {
            inject(EnvironmentInjector);
            const result = await SCENARIOS[index].run(ctx);
            return JSON.parse(JSON.stringify(result ?? null));
        });
    } finally {
        subscriptions.forEach((s) => s.unsubscribe());
    }
}

describe('Reactive Forms vs Signal Forms parity', () => {
    SCENARIOS.forEach((scenario, index) => {
        it(`${scenario.id}: ${scenario.title}`, async () => {
            const reactive = await runScenario('reactive', index);
            TestBed.resetTestingModule();
            const signal = await runScenario('signal', index);

            if (scenario.intentionalDifference) {
                const { intentionalDifference } = scenario;
                recordParity({ id: scenario.id, title: scenario.title, reactive, signal, parity: 'differs-intentionally', note: intentionalDifference.note });
                expect(reactive).toEqual(intentionalDifference.reactive);
                expect(signal).toEqual(intentionalDifference.signal);
                expect(signal).not.toEqual(reactive);
            } else {
                expect(signal).toEqual(reactive);
                recordParity({ id: scenario.id, title: scenario.title, reactive, signal, parity: 'yes' });
            }
        });
    });
});
