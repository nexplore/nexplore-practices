import { TestBed } from '@angular/core/testing';
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
            return;
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
            const loadFn = jest.fn((params: IQueryParamsWithFilter<TestFilter>) => of({ data: [], total: 0 }));

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
});

