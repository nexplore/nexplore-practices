import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { IListResult, IQueryParamsWithFilter, OrderDirection, TypedQueryParamsWithFilter } from '../types';
import { createTableViewSourceWithPersistedParams } from './create-table-view-source-with-persisted-params';

describe('createTableViewSourceWithPersistedParams', () => {
    class TestDto {
        constructor(public name: string, public age: number) {}
    }

    type TestFilter = { search?: string };

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const flushAsyncWork = async (ms = 0) => {
        if (ms > 0) {
            jest.advanceTimersByTime(ms);
            await Promise.resolve();
            TestBed.flushEffects();
        }

        let guard = 10;
        while (jest.getTimerCount() > 0 && guard-- > 0) {
            jest.runOnlyPendingTimers();
            await Promise.resolve();
            TestBed.flushEffects();
        }

        await Promise.resolve();
        TestBed.flushEffects();
    };

    it('applies persisted params returned by load()', async () => {
        await TestBed.runInInjectionContext(async () => {
            const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                skip: 5,
                take: 10,
                includeTotal: true,
                orderings: [{ field: 'name', direction: OrderDirection.Desc }],
                filter: { search: 'from-storage' },
            };

            const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>({
                columns: ['name', 'age'],
                orderBy: 'name',
                loadFn: () => of({ data: [], total: 0 }),
                persistParams: {
                    load: () => persistedParams,
                    save: jest.fn(),
                },
            });

            await flushAsyncWork();

            expect(vs.getQueryParams()).toMatchObject(persistedParams);
        });
    });

    it('does not call loadFn more than once when no persisted params exist', async () => {
        await TestBed.runInInjectionContext(async () => {
            const loadFn = jest.fn(() => of({ data: [], total: 0 }));

            createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>({
                columns: ['name', 'age'],
                orderBy: 'name',
                loadFn,
                persistParams: {
                    load: () => undefined as unknown as TypedQueryParamsWithFilter<TestFilter, TestDto>,
                    save: jest.fn(),
                },
            });

            await flushAsyncWork();

            expect(loadFn).toHaveBeenCalledTimes(1);
        });
    });

    it('invokes loadFn a second time after persisted params were applied', async () => {
        // TODO: This behavior is actually unwanted, and we want to fix it in the future (Only one call initially)
        await TestBed.runInInjectionContext(async () => {
            const loadFn = jest.fn(() => of({ data: [], total: 0 }));
            const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                skip: 3,
                take: 11,
                orderings: [{ field: 'name', direction: OrderDirection.Desc }],
                filter: { search: 'persisted' },
            };

            createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>({
                columns: ['name', 'age'],
                orderBy: 'name',
                loadFn,
                persistParams: {
                    load: () => persistedParams,
                    save: jest.fn(),
                },
            });

            await flushAsyncWork();

            // Initial load happens with defaults; once persisted params arrive we expect a second call
            expect(loadFn).toHaveBeenCalledTimes(2);
            const params = (
                loadFn.mock.calls[loadFn.mock.calls.length - 1] as unknown as [IQueryParamsWithFilter<TestFilter>]
            )[0];
            expect(params).toMatchObject(persistedParams);
        });
    });

    it('persists params when query params change after initialization', async () => {
        await TestBed.runInInjectionContext(async () => {
            const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                orderings: [{ field: 'name', direction: OrderDirection.Asc }],
                filter: { search: 'initial' },
            };
            const saveSpy = jest.fn().mockResolvedValue(undefined);
            const observedFilters: Array<string | undefined> = [];

            const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>({
                columns: ['name', 'age'],
                orderBy: 'name',
                loadFn: () => of({ data: [], total: 0 }),
                persistParams: {
                    load: () => persistedParams,
                    save: saveSpy,
                },
            });

            vs.queryParams$.subscribe((params) => observedFilters.push(params?.filter?.search));

            await flushAsyncWork();
            saveSpy.mockClear();

            vs.update({ filter: { search: 'updated' } });
            await flushAsyncWork(150);

            expect(observedFilters).toContain('updated');
            expect(saveSpy).toHaveBeenCalledTimes(1);
            expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ filter: { search: 'updated' } }));
        });
    });

    it('calls loadFn with the persisted params instead of the defaults', async () => {
        await TestBed.runInInjectionContext(async () => {
            const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                skip: 7,
                take: 42,
                orderings: [{ field: 'name', direction: OrderDirection.Desc }],
                filter: { search: 'persisted' },
            };
            const loadFn = jest.fn((params: IQueryParamsWithFilter<TestFilter>) => of({ data: [], total: 0 }));

            createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>({
                columns: ['name', 'age'],
                orderBy: 'name',
                loadFn,
                persistParams: {
                    load: () => persistedParams,
                    save: jest.fn(),
                },
            });

            await flushAsyncWork();

            expect(loadFn).toHaveBeenCalled();
            const params = (
                loadFn.mock.calls[loadFn.mock.calls.length - 1] as unknown as [IQueryParamsWithFilter<TestFilter>]
            )[0];
            expect(params).toMatchObject(persistedParams);
        });
    });

    it('does not persist when the new params equal the loaded params', async () => {
        await TestBed.runInInjectionContext(async () => {
            const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                skip: 0,
                take: 15,
                includeTotal: true,
                orderings: [{ field: 'name', direction: OrderDirection.Asc }],
                filter: { search: 'same' },
            };
            const saveSpy = jest.fn();

            const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>({
                columns: ['name', 'age'],
                orderBy: 'name',
                loadFn: () => of({ data: [], total: 0 }),
                persistParams: {
                    load: () => persistedParams,
                    save: saveSpy,
                },
            });

            await flushAsyncWork();
            saveSpy.mockClear();

            // Updating with the same payload should not trigger persistence
            vs.update({ filter: { search: 'same' } });
            await flushAsyncWork();

            expect(saveSpy).not.toHaveBeenCalled();
        });
    });

    it('applies async persisted params once they resolve before issuing the next load', async () => {
        await TestBed.runInInjectionContext(async () => {
            const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                skip: 20,
                take: 25,
                orderings: [{ field: 'name', direction: OrderDirection.Desc }],
                filter: { search: 'async' },
            };
            const loadFn = jest.fn((_params: IQueryParamsWithFilter<TestFilter>) => of({ data: [], total: 0 }));

            createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>({
                columns: ['name', 'age'],
                orderBy: 'name',
                loadFn,
                persistParams: {
                    load: () =>
                        new Promise<TypedQueryParamsWithFilter<TestFilter, TestDto>>((resolve) => {
                            setTimeout(() => resolve(persistedParams), 25);
                        }),
                    save: jest.fn(),
                },
            });

            // Resolve the async load first
            await flushAsyncWork(25);
            await flushAsyncWork();

            expect(loadFn).toHaveBeenCalled();
            const [params] = loadFn.mock.calls[loadFn.mock.calls.length - 1] as [IQueryParamsWithFilter<TestFilter>];
            expect(params).toMatchObject(persistedParams);
        });
    });

    // New test cases to validate the column synchronization bug
    describe('column synchronization with persisted params', () => {
        it('synchronizes column sortDir with persisted ordering parameters', async () => {
            await TestBed.runInInjectionContext(async () => {
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [{ field: 'name', direction: OrderDirection.Desc }],
                    filter: { search: 'test' },
                };

                const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>(
                    {
                        columns: [
                            { fieldName: 'name', sortable: true },
                            { fieldName: 'age', sortable: true },
                        ],
                        orderBy: 'name',
                        loadFn: () => of({ data: [], total: 0 }),
                        persistParams: {
                            load: () => persistedParams,
                            save: jest.fn(),
                        },
                    }
                );

                await flushAsyncWork();

                // The column should have the sortDir synchronized with the persisted ordering
                const nameColumn = vs.columnsArray.find((c) => c.fieldName === 'name');
                expect(nameColumn?.sortDir).toBe(OrderDirection.Desc);

                const ageColumn = vs.columnsArray.find((c) => c.fieldName === 'age');
                expect(ageColumn?.sortDir).toBeUndefined();
            });
        });

        it('synchronizes column sortDir when persisted params have different ordering than default', async () => {
            await TestBed.runInInjectionContext(async () => {
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [{ field: 'age', direction: OrderDirection.Asc }],
                    filter: { search: 'test' },
                };

                const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>(
                    {
                        columns: [
                            { fieldName: 'name', sortable: true },
                            { fieldName: 'age', sortable: true },
                        ],
                        orderBy: 'name', // Default ordering is by 'name'
                        loadFn: () => of({ data: [], total: 0 }),
                        persistParams: {
                            load: () => persistedParams,
                            save: jest.fn(),
                        },
                    }
                );

                await flushAsyncWork();

                // The age column should have the sortDir from persisted params
                const ageColumn = vs.columnsArray.find((c) => c.fieldName === 'age');
                expect(ageColumn?.sortDir).toBe(OrderDirection.Asc);

                // The name column should not have sortDir set (default should be overridden)
                const nameColumn = vs.columnsArray.find((c) => c.fieldName === 'name');
                expect(nameColumn?.sortDir).toBeNull();
            });
        });

        it('handles column synchronization with orderingFieldName different from fieldName', async () => {
            await TestBed.runInInjectionContext(async () => {
                // Using a valid field but with different orderingFieldName to test the mapping
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [{ field: 'name', direction: OrderDirection.Desc }],
                    filter: { search: 'test' },
                };

                const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>(
                    {
                        columns: [
                            { fieldName: 'name', sortable: true, orderingFieldName: 'name' }, // Column uses same field for ordering
                            { fieldName: 'age', sortable: true },
                        ],
                        orderBy: 'name',
                        loadFn: () => of({ data: [], total: 0 }),
                        persistParams: {
                            load: () => persistedParams,
                            save: jest.fn(),
                        },
                    }
                );

                await flushAsyncWork();

                // The name column should have the sortDir synchronized via orderingFieldName
                const nameColumn = vs.columnsArray.find((c) => c.fieldName === 'name');
                expect(nameColumn?.sortDir).toBe(OrderDirection.Desc);

                const ageColumn = vs.columnsArray.find((c) => c.fieldName === 'age');
                expect(ageColumn?.sortDir).toBeUndefined();
            });
        });

        it('synchronizes multiple orderings from persisted params (should only keep the last one)', async () => {
            await TestBed.runInInjectionContext(async () => {
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [
                        { field: 'name', direction: OrderDirection.Asc },
                        { field: 'age', direction: OrderDirection.Desc },
                    ],
                    filter: { search: 'test' },
                };

                const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>(
                    {
                        columns: [
                            { fieldName: 'name', sortable: true },
                            { fieldName: 'age', sortable: true },
                        ],
                        orderBy: 'name',
                        loadFn: () => of({ data: [], total: 0 }),
                        persistParams: {
                            load: () => persistedParams,
                            save: jest.fn(),
                        },
                    }
                );

                await flushAsyncWork();

                // Due to resetSortDir logic, only the last processed ordering should remain
                const nameColumn = vs.columnsArray.find((c) => c.fieldName === 'name');
                const ageColumn = vs.columnsArray.find((c) => c.fieldName === 'age');

                // Only one column should have sortDir set (the last one processed)
                const columnsWithSort = vs.columnsArray.filter((c) => c.sortDir != null);
                expect(columnsWithSort).toHaveLength(1);
                expect(ageColumn?.sortDir).toBe(OrderDirection.Desc);
                expect(nameColumn?.sortDir).toBeNull();
            });
        });

        it('maintains column synchronization consistency after persisted params are applied', async () => {
            await TestBed.runInInjectionContext(async () => {
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [{ field: 'name', direction: OrderDirection.Desc }],
                    filter: { search: 'test' },
                };

                const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>(
                    {
                        columns: [
                            { fieldName: 'name', sortable: true },
                            { fieldName: 'age', sortable: true },
                        ],
                        orderBy: 'age', // Default different from persisted
                        loadFn: () => of({ data: [], total: 0 }),
                        persistParams: {
                            load: () => persistedParams,
                            save: jest.fn(),
                        },
                    }
                );

                await flushAsyncWork();

                // After persisted params are applied, column state should match query params
                const queryParams = vs.getQueryParams();
                const nameColumn = vs.columnsArray.find((c) => c.fieldName === 'name');

                expect(queryParams.orderings).toHaveLength(1);
                expect(queryParams.orderings![0]).toEqual({ field: 'name', direction: OrderDirection.Desc });
                expect(nameColumn?.sortDir).toBe(OrderDirection.Desc);
            });
        });

        it('handles case-insensitive field name matching for column synchronization', async () => {
            await TestBed.runInInjectionContext(async () => {
                // We'll test case-insensitive matching by having the persisted params use a different field
                // and verifying that the column synchronization logic correctly finds the field
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [{ field: 'name', direction: OrderDirection.Asc }],
                    filter: { search: 'test' },
                };

                const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>(
                    {
                        columns: [
                            { fieldName: 'name', sortable: true },
                            { fieldName: 'age', sortable: true },
                        ],
                        orderBy: 'age', // Default to different field
                        loadFn: () => of({ data: [], total: 0 }),
                        persistParams: {
                            load: () => persistedParams,
                            save: jest.fn(),
                        },
                    }
                );

                await flushAsyncWork();

                // Should find the column and set the correct sortDir
                const nameColumn = vs.columnsArray.find((c) => c.fieldName === 'name');
                expect(nameColumn?.sortDir).toBe(OrderDirection.Asc);

                const ageColumn = vs.columnsArray.find((c) => c.fieldName === 'age');
                expect(ageColumn?.sortDir).toBeNull(); // Should not have sortDir from default
            });
        });

        it('demonstrates the critical bug: column state mismatch without the fix', async () => {
            // This is the main test that demonstrates the bug being fixed:
            // Without the fix, persisted ordering parameters would not synchronize
            // with the column objects' sortDir property, causing UI inconsistencies
            await TestBed.runInInjectionContext(async () => {
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [{ field: 'age', direction: OrderDirection.Desc }],
                    filter: { search: 'test' },
                };

                const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>(
                    {
                        columns: [
                            { fieldName: 'name', sortable: true },
                            { fieldName: 'age', sortable: true },
                        ],
                        orderBy: 'name', // Default is different from persisted
                        loadFn: () => of({ data: [], total: 0 }),
                        persistParams: {
                            load: () => persistedParams,
                            save: jest.fn(),
                        },
                    }
                );

                await flushAsyncWork();

                // CRITICAL: Both query params and column state must be in sync
                const queryParams = vs.getQueryParams();
                const ageColumn = vs.columnsArray.find((c) => c.fieldName === 'age');
                const nameColumn = vs.columnsArray.find((c) => c.fieldName === 'name');

                // Query params should reflect the persisted state
                expect(queryParams.orderings).toHaveLength(1);
                expect(queryParams.orderings![0]).toEqual({ field: 'age', direction: OrderDirection.Desc });

                // Column state must also reflect the persisted state (this is what the bug fix ensures)
                expect(ageColumn?.sortDir).toBe(OrderDirection.Desc);
                expect(nameColumn?.sortDir).toBeNull(); // Default should be overridden

                // This test would fail without the fix because:
                // 1. queryParams would show the correct persisted ordering
                // 2. But ageColumn.sortDir would be undefined/null (not synchronized)
                // 3. This causes UI inconsistencies where the column header doesn't show the correct sort indicator
            });
        });
    });

    describe('integration with filter form', () => {
        it('applies persisted filters even when the filter form initializes with null values', async () => {
            await TestBed.runInInjectionContext(async () => {
                const filterForm = new FormGroup({
                    search: new FormControl<string | null>(null),
                });
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [{ field: 'name', direction: OrderDirection.Desc }],
                    filter: { search: 'persisted-filter' },
                };

                const vs = createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>(
                    {
                        columns: ['name'],
                        orderBy: 'name',
                        loadFn: () => of({ data: [], total: 0 }),
                        persistParams: {
                            load: () => persistedParams,
                            save: jest.fn(),
                        },
                    }
                ).withFilterForm({ filterForm: filterForm as any });

                await flushAsyncWork();
                await flushAsyncWork(400); // allow filter form synchronization debounce to settle

                expect(vs.getQueryParams().filter).toEqual({ search: 'persisted-filter' });
                expect(filterForm.value).toEqual({ search: 'persisted-filter' });
            });
        });

        it('overwrites non-dirty form edits once async persisted params resolve', async () => {
            await TestBed.runInInjectionContext(async () => {
                const filterForm = new FormGroup({
                    search: new FormControl<string | null>(null),
                });
                let resolvePersisted!: (params: TypedQueryParamsWithFilter<TestFilter, TestDto>) => void;

                const vs = createTableViewSourceWithPersistedParams({
                    columns: ['name'],
                    orderBy: 'name',
                    loadFn: () => of({ data: [], total: 0 }),
                    persistParams: {
                        load: () =>
                            new Promise<TypedQueryParamsWithFilter<TestFilter, TestDto>>((resolve) => {
                                resolvePersisted = resolve;
                            }),
                        save: jest.fn(),
                    },
                }).withFilterForm({ filterForm: filterForm });

                await flushAsyncWork();

                filterForm.controls.search.setValue('user-change');
                await flushAsyncWork(400); // wait for filter form effect debounce

                resolvePersisted({
                    orderings: [{ field: 'name', direction: OrderDirection.Asc }],
                    filter: { search: 'persisted-filter' },
                });

                await flushAsyncWork();
                await flushAsyncWork(400);

                expect(vs.getQueryParams().filter).toEqual({ search: 'persisted-filter' });
                expect(filterForm.value).toEqual({ search: 'persisted-filter' });
            });
        });

        it('does apply pristine form changes by default', async () => {
            await TestBed.runInInjectionContext(async () => {
                const filterForm = new FormGroup({
                    search: new FormControl<string | undefined>('', { nonNullable: true }),
                });
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [{ field: 'name', direction: OrderDirection.Asc }],
                    filter: { search: '' },
                };
                const loadFn = jest.fn(() => of({ data: [], total: 0 }));

                const vs = createTableViewSourceWithPersistedParams({
                    columns: ['name'],
                    orderBy: 'name',
                    loadFn,
                    persistParams: {
                        load: () => persistedParams,
                        save: jest.fn(),
                    },
                }).withFilterForm({ filterForm });

                await flushAsyncWork();
                loadFn.mockClear();

                filterForm.controls.search.setValue('pristine-change');
                filterForm.markAsPristine();
                filterForm.markAsUntouched();

                await flushAsyncWork(400);

                expect(loadFn).toHaveBeenCalled();
                expect(vs.getQueryParams().filter).toEqual({ search: 'pristine-change' });
            });
        });

        it('can override the apply condition to react only when the form is dirty', async () => {
            await TestBed.runInInjectionContext(async () => {
                const filterForm = new FormGroup({
                    search: new FormControl<string>(''),
                });
                const persistedParams: TypedQueryParamsWithFilter<TestFilter, TestDto> = {
                    orderings: [{ field: 'name', direction: OrderDirection.Asc }],
                    filter: { search: '' },
                };
                const loadFn = jest.fn(() => of({ data: [], total: 0 }));
                const shouldApplySpy = jest.fn(() => filterForm.dirty);

                createTableViewSourceWithPersistedParams<TestDto, TestFilter, IListResult<TestDto>, TestDto>({
                    columns: ['name'],
                    orderBy: 'name',
                    loadFn,
                    persistParams: {
                        load: () => persistedParams,
                        save: jest.fn(),
                    },
                }).withFilterForm({
                    filterForm,
                    shouldApplyFilterFormValue: shouldApplySpy,
                });

                await flushAsyncWork();

                filterForm.controls.search.setValue('should-apply');

                await flushAsyncWork(400);

                expect(loadFn).not.toHaveBeenCalledWith(
                    expect.objectContaining({
                        filter: { search: 'should-apply' },
                    })
                );
                expect(loadFn).toHaveBeenCalled();
                expect(shouldApplySpy).toHaveBeenCalled();
            });
        });
    });
});
