import { TestBed } from "@angular/core/testing";
import { describe, expect, it, jest } from '@jest/globals';
import { tryDestroyInjector } from './try-destroy-injector';
import { effect, inject, Injector, runInInjectionContext, signal } from '@angular/core';

describe('tryDestroyInjector', () => {
    it('should call destroy method if it exists', () => {
        const mockDestroyMethod = jest.fn();
        const mockInjector = {
            destroy: mockDestroyMethod,
        } as unknown as Injector;

        tryDestroyInjector(mockInjector);

        expect(mockDestroyMethod).toHaveBeenCalled();
    });

    it('should not throw if destroy method does not exist', () => {
        const mockInjector = {} as Injector;

        expect(() => {
            tryDestroyInjector(mockInjector);
        }).not.toThrow();
    });

    it('should not throw if injector is null', () => {
        expect(() => {
            tryDestroyInjector(null as unknown as Injector);
        }).not.toThrow();
    });

    it('should not throw if injector is undefined', () => {
        expect(() => {
            tryDestroyInjector(undefined as unknown as Injector);
        }).not.toThrow();
    });

    it('should actually mark the injector as destroyed', () => {
        TestBed.runInInjectionContext(() => {
            const injector = Injector.create({providers: [], parent: inject(Injector)});
            tryDestroyInjector(injector);
            const destroyed = (injector as any).destroyed;
            expect(destroyed).toBe(true);
        });
    });

    it ('Should stop effects from running after injector is destroyed', () => {
        TestBed.runInInjectionContext(() => {
            const injector = Injector.create({providers: [], parent: inject(Injector)});
            let isDestroyed = false;
            let latestValue: any = null;
            const mySignal = signal(0);
            runInInjectionContext(injector, () => {
                effect((onCleanup) => {
                    latestValue = mySignal();

                    onCleanup(() => {
                        isDestroyed = true;
                    });
                });
            });

            mySignal.set(1);
            TestBed.flushEffects();

            tryDestroyInjector(injector);

            mySignal.set(2);
            TestBed.flushEffects();

            expect(isDestroyed).toBe(true);
            expect(latestValue).toBe(1);
        });
    });
});
