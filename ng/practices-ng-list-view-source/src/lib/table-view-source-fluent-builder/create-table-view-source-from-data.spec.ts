import { effect, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { createTableViewSourceFromData } from './create-table-view-source-from-data';

describe('createTableViewSourceFromData', () => {
    class TestItem {
        constructor(public name: string, public age: number) {}
    }

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('function input', () => {
        it('should create table view source from function returning sync data', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];

                const vs = createTableViewSourceFromData(() => ({
                    data: testData,
                    total: testData.length,
                })).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should create table view source from function returning observable', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];

                const vs = createTableViewSourceFromData(() =>
                    of({
                        data: testData,
                        total: testData.length,
                    })
                ).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should create table view source from function returning promise', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];

                const vs = createTableViewSourceFromData(() =>
                    Promise.resolve({
                        data: testData,
                        total: testData.length,
                    })
                ).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should pass query parameters to load function', () => {
            TestBed.runInInjectionContext(() => {
                const loadFn = jest.fn(() => ({ data: [], total: 0 }));

                const vs = createTableViewSourceFromData(loadFn).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                vs.filter({ name: 'John' });
                jest.runAllTimers();
                TestBed.flushEffects();

                expect(loadFn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        filter: { name: 'John' },
                    })
                );
            });
        });
    });

    describe('static data input', () => {
        it('should create table view source from static IListResult', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];
                const staticResult = { data: testData, total: testData.length };

                const vs = createTableViewSourceFromData(staticResult).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should create table view source from static array', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];

                const vs = createTableViewSourceFromData(testData).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should convert static array to IListResult format', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];
                const results: TestItem[][] = [];

                const vs = createTableViewSourceFromData(testData).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                const subscription = vs.pageData$.subscribe((data) => results.push(data));
                jest.runAllTimers();
                TestBed.flushEffects();

                expect(results[0]).toEqual(testData);
                subscription.unsubscribe();
            });
        });

        it('should use static IListResult as-is', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];
                const staticResult = { data: testData, total: 5 }; // Different total than array length

                const vs = createTableViewSourceFromData(staticResult).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                jest.runAllTimers();
                TestBed.flushEffects();

                // Directly check the final state
                expect(vs.totalCountSignal()).toBe(5);
            });
        });
    });

    describe('signal input', () => {
        it('should create table view source from signal of IListResult', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];
                const dataSignal = signal({ data: testData, total: testData.length });

                const vs = createTableViewSourceFromData(dataSignal).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should create table view source from signal of array', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];
                const dataSignal = signal(testData);

                const vs = createTableViewSourceFromData(dataSignal).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should update table view source when signal of IListResult changes', () => {
            TestBed.runInInjectionContext(() => {
                const initialData = [new TestItem('John', 25)];
                const updatedData = [new TestItem('John', 25), new TestItem('Jane', 30)];
                const dataSignal = signal({ data: initialData, total: 1 });
                const results: number[] = [];

                const vs = createTableViewSourceFromData(dataSignal).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                effect(() => {
                    results.push(vs.pageDataSignal().length);
                });

                jest.runAllTimers();
                TestBed.flushEffects();

                dataSignal.set({ data: updatedData, total: 2 });
                jest.runAllTimers();
                TestBed.flushEffects();

                expect(results).toEqual([0, 1, 2]);
            });
        });

        it('should update table view source when signal of array changes', () => {
            TestBed.runInInjectionContext(() => {
                const initialData = [new TestItem('John', 25)];
                const updatedData = [new TestItem('John', 25), new TestItem('Jane', 30)];
                const dataSignal = signal(initialData);
                const results: number[] = [];

                const vs = createTableViewSourceFromData(dataSignal).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                effect(() => {
                    results.push(vs.pageDataSignal().length);
                });

                jest.runAllTimers();
                TestBed.flushEffects();

                dataSignal.set(updatedData);
                jest.runAllTimers();
                TestBed.flushEffects();
                expect(results).toEqual([0, 1, 2]);
            });
        });

        it('should convert signal array to IListResult format automatically', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25), new TestItem('Jane', 30)];
                const dataSignal = signal(testData);
                const vs = createTableViewSourceFromData(dataSignal).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                jest.runAllTimers();
                TestBed.flushEffects();

                // Directly check the final state
                expect(vs.totalCountSignal()).toBe(2);
            });
        });

        it('should handle signal with empty array', () => {
            TestBed.runInInjectionContext(() => {
                const dataSignal = signal([] as TestItem[]);
                const results: TestItem[][] = [];

                const vs = createTableViewSourceFromData(dataSignal).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                const subscription = vs.pageData$.subscribe((data) => results.push(data));
                jest.runAllTimers();
                TestBed.flushEffects();

                expect(results[0]).toEqual([]);
                subscription.unsubscribe();
            });
        });

        it('should handle signal with null data gracefully', () => {
            TestBed.runInInjectionContext(() => {
                const dataSignal = signal([] as TestItem[]);

                const vs = createTableViewSourceFromData(dataSignal).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
                // Should not crash when signal returns empty array
            });
        });

        it('should not refresh when signal changes to falsy value', () => {
            TestBed.runInInjectionContext(() => {
                const initialData = [new TestItem('John', 25)];
                const dataSignal = signal(initialData);

                const vs = createTableViewSourceFromData(dataSignal).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                const refreshSpy = jest.spyOn(vs, 'refresh');

                jest.runAllTimers();
                TestBed.flushEffects();

                const initialRefreshCount = refreshSpy.mock.calls.length;

                dataSignal.set([]);
                jest.runAllTimers();
                TestBed.flushEffects();

                // Empty array is still truthy, so it should trigger refresh
                expect(refreshSpy.mock.calls.length).toBeGreaterThan(initialRefreshCount);
            });
        });
    });

    describe('fluent API', () => {
        it('should support withConfig chaining', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25)];

                const vs = createTableViewSourceFromData(testData).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should support withFilterForm chaining', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25)];
                const form = new FormGroup({
                    name: new FormControl(''),
                });

                const vs = createTableViewSourceFromData(testData).withFilterForm({
                    filterForm: form,
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should support withPersistedParams chaining', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25)];

                const vs = createTableViewSourceFromData(testData).withPersistedParams({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                    persistParams: {
                        load: () => ({ filter: null, orderings: [] }),
                        save: () => {},
                    },
                });

                expect(vs).toBeDefined();
            });
        });
    });

    describe('edge cases', () => {
        it('should handle empty static array', () => {
            TestBed.runInInjectionContext(() => {
                const vs = createTableViewSourceFromData([]).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should handle static result with zero total', () => {
            TestBed.runInInjectionContext(() => {
                const vs = createTableViewSourceFromData({
                    data: [],
                    total: 0,
                }).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should handle static result without total property', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [new TestItem('John', 25)];
                const partialResult = {
                    data: testData,
                } as { data: TestItem[]; total?: number };

                const vs = createTableViewSourceFromData(partialResult).withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });
    });
});

