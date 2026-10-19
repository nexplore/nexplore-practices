import type { Injector } from '@angular/core';
import type { Observable } from 'rxjs';

/**
 * Everything a scenario may use. The fluent API has the same call shape in both implementations,
 * so a scenario is written once and gets the implementation's `formGroup` injected.
 */
export interface ParityContext {
    readonly implementation: 'reactive' | 'signal';
    /** The `formGroup` namespace (`withBuilder`, `withType`, `withResetFromSignal`) of the implementation under test. */
    readonly formGroup: any;
    /** The unwrapped `formGroup` namespace (fluent calls are not flushed). */
    readonly rawFormGroup: any;
    readonly createFormGroup: any;
    readonly injector: Injector;
    /** Flushes effects (and thereby effect-driven observables). */
    flush(): void;
    /** Waits (real time) and flushes, for async validators. */
    settle(ms?: number): Promise<void>;
    /** Pushes a value onto an array node (FormArray needs a control, signal arrays take the value; new items get the validators of the item template). */
    arrayPush(array: any, value: unknown, validators?: unknown[]): void;
    /** Collects the emissions of an observable. */
    collect<T>(source: Observable<T>): T[];
    /** Runs a submit: touches all fields, runs `action` only if the form is valid. Resolves with whether the action ran. */
    submit(form: any, action: (value: any) => unknown | Promise<unknown>): Promise<boolean>;
    /** Creates a control-like binding for a value (used for validator functions that need an AbstractControl). */
    errorsOf(form: any, path: string): unknown;
}

export interface ParityScenario {
    id: string;
    title: string;
    run(ctx: ParityContext): Promise<unknown> | unknown;
    /**
     * Set when the implementations intentionally behave differently. Each implementation's actual result is asserted
     * against its own expectation, and the note is recorded in the parity matrix.
     */
    intentionalDifference?: {
        reactive: unknown;
        signal: unknown;
        note: string;
    };
}
