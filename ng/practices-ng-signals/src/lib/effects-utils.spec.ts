import { effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { withEffects } from './effects-utils';

describe('withEffects', () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    it('should run method with source object as parameter', () => {
        TestBed.runInInjectionContext(() => {
            let resultSource: any;
            const source = withEffects({}, (mySource) => {
                resultSource = mySource;
            });

            jest.runAllTimers();

            expect(resultSource).toBe(source);
        });
    });

    it('should run effect inside factory method', () => {
        const result: boolean[] = [];
        TestBed.runInInjectionContext(() => {
            const mySignal = signal(false);
            const _source = withEffects(result, (result) => {
                effect(() => {
                    const value = mySignal();
                    result.push(value);
                });
            });

            jest.runAllTimers();

            mySignal.set(true);
            TestBed.flushEffects();

            mySignal.set(false);
            TestBed.flushEffects();
        });

        expect(result).toEqual([false, true, false]);
    });

    it('should work with self reference inside factory method', () => {
        const result: boolean[] = [];
        TestBed.runInInjectionContext(() => {
            const mySignal = signal(false);
            const source = withEffects({ result }, () => {
                const selfReferencedResult = source.result;
                effect(() => {
                    const value = mySignal();
                    selfReferencedResult.push(value);
                });
            });

            jest.runAllTimers();

            mySignal.set(true);
            TestBed.flushEffects();

            mySignal.set(false);
            TestBed.flushEffects();
        });

        expect(result).toEqual([false, true, false]);
    });
});
