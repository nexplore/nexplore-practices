/* eslint-disable no-redeclare */
import { assertInInjectionContext, computed, isSignal, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, OperatorFunction } from 'rxjs';
import { SignalSource } from './types';

export function computedPipe<T>(signal: SignalSource<T>): Signal<T>;
export function computedPipe<T, A>(signal: SignalSource<T>, op1: OperatorFunction<T, A>): Signal<A>;
export function computedPipe<T, A, B>(
    signal: SignalSource<T>,
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>
): Signal<B>;
export function computedPipe<T, A, B, C>(
    signal: SignalSource<T>,
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>
): Signal<C>;
export function computedPipe<T, A, B, C, D>(
    signal: SignalSource<T>,
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>
): Signal<D>;
export function computedPipe<T, A, B, C, D, E>(
    signal: SignalSource<T>,
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>
): Signal<E>;
export function computedPipe<T, A, B, C, D, E, F>(
    signal: SignalSource<T>,
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>
): Signal<F>;
export function computedPipe<T, A, B, C, D, E, F, G>(
    signal: SignalSource<T>,
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>
): Signal<G>;
export function computedPipe<T, A, B, C, D, E, F, G, H>(
    signal: SignalSource<T>,
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>
): Signal<H>;
export function computedPipe<T, A, B, C, D, E, F, G, H, I>(
    signal: SignalSource<T>,
    op1: OperatorFunction<T, A>,
    op2: OperatorFunction<A, B>,
    op3: OperatorFunction<B, C>,
    op4: OperatorFunction<C, D>,
    op5: OperatorFunction<D, E>,
    op6: OperatorFunction<E, F>,
    op7: OperatorFunction<F, G>,
    op8: OperatorFunction<G, H>,
    op9: OperatorFunction<H, I>
): Signal<I>;
/**
 * A utility that combines a signal with a pipe of RX operators.
 *
 * Example:
 * ```ts
 * const signal = signal(1);
 * const delayedSignal = computedPipe(signal, delay(1000));
 * ```
 *
 * This example is the equivalent of using the `toObservable` and `toSignal` functions:
 * ```ts
 * const signal = signal(1);
 * const delayedSignal = toSignal(toObservable(signal).pipe(delay(1000)));
 * ```
 *
 * @param signalOrObs A signal or computed function
 * @param operations A pipe of RX operators
 * @returns A signal that emits the result of the pipe
 */
export function computedPipe<TSource, TResult = unknown>(
    signalOrObs: SignalSource<TSource>,
    ...operations: OperatorFunction<any, any>[]
): Signal<undefined | TResult> {
    assertInInjectionContext(computedPipe);
    const sourceObservable = 
        signalOrObs instanceof Observable
            ? signalOrObs
            : toObservable(isSignal(signalOrObs) ? signalOrObs : computed(signalOrObs));

    const observable = (sourceObservable.pipe as any)(...operations);
    return toSignal(observable);
}
