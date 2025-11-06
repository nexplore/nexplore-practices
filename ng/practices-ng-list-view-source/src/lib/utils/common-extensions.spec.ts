import { effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListViewSource } from '../implementation/list-view-source';
import { OrderDirection } from '../types';
import { enhanceListViewSource } from './internal-util';

describe('enhanceWithMutableData', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    it('should enhance with writable pageDataSignal', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const source = enhanceListViewSource(
                new ListViewSource(
                    (_params) =>
                        of({
                            data: [1, 2],
                            total: 2,
                        }),
                    {}
                )
            ).withMutableData();

            effect(() => {
                const data = source.pageDataSignal();
                results.push(data);
            });

            source.refresh();

            jest.runAllTimers();
            TestBed.flushEffects();

            source.pageDataSignal.set([1, 2, 3]);

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([[], [1, 2], [1, 2, 3]]);
        });
    });

    it('should reset data when refresh is called', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const source = enhanceListViewSource(
                new ListViewSource(
                    (_params) =>
                        of({
                            data: [1, 2],
                            total: 2,
                        }),
                    {}
                )
            ).withMutableData();

            effect(() => {
                const data = source.pageDataSignal();
                results.push(data);
            });

            jest.runAllTimers();
            TestBed.flushEffects();

            source.pageDataSignal.set([1, 2, 3]);

            jest.runAllTimers();
            TestBed.flushEffects();

            source.refresh();

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([[], [1, 2], [1, 2, 3], [1, 2]]);
        });
    });

    it('should stream new value from page$ after pageDataSignal is set', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const source = enhanceListViewSource(
                new ListViewSource(
                    (_params) =>
                        of({
                            data: [1, 2],
                            total: 2,
                        }),
                    {}
                )
            ).withMutableData();

            source.page$.subscribe((page: any) => results.push(page));

            jest.runAllTimers();
            TestBed.flushEffects();

            source.pageDataSignal.set([1, 2, 3]);

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([
                { data: [1, 2], total: 2 },
                { data: [1, 2, 3], total: 2 },
            ]);
        });
    });

    it('should stream new value from pageData$ after pageDataSignal is set', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const source = enhanceListViewSource(
                new ListViewSource(
                    (_params) =>
                        of({
                            data: [1, 2],
                            total: 2,
                        }),
                    {}
                )
            ).withMutableData();

            source.pageData$.subscribe((page: any) => results.push(page));

            jest.runAllTimers();
            TestBed.flushEffects();

            source.pageDataSignal.set([1, 2, 3]);

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([
                [1, 2],
                [1, 2, 3],
            ]);
        });
    });

    it('should sort manipulated data according to query params', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const testData = [
                { id: 4, name: 'a' },
                { id: 3, name: 'b' },
                { id: 2, name: 'c' },
                { id: 1, name: 'd' },
            ];
            const source = enhanceListViewSource(
                new ListViewSource(
                    (_params) =>
                        of({
                            data: testData,
                            total: testData.length,
                        }),
                    {
                        orderings: [{ field: 'id', direction: OrderDirection.Asc }],
                    }
                )
            ).withMutableData();

            source.pageData$.subscribe((page: any) => results.push(page));

            jest.runAllTimers();
            TestBed.flushEffects();

            source.pageDataSignal.update((data: any) => [
                ...data,
                {
                    id: 6,
                    name: 'f',
                },
                {
                    id: 7,
                    name: 'g',
                },
                {
                    id: 5,
                    name: 'e',
                },
            ]);

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([
                [
                    // First occurence is not sorted yet as it comes "from the server"
                    { id: 4, name: 'a' },
                    { id: 3, name: 'b' },
                    { id: 2, name: 'c' },
                    { id: 1, name: 'd' },
                ],
                [
                    { id: 1, name: 'd' },
                    { id: 2, name: 'c' },
                    { id: 3, name: 'b' },
                    { id: 4, name: 'a' },
                    { id: 5, name: 'e' },
                    { id: 6, name: 'f' },
                    { id: 7, name: 'g' },
                ],
            ]);
        });
    });

    it('should not sort manipulated data when disabled', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const testData = [
                { id: 4, name: 'a' },
                { id: 3, name: 'b' },
                { id: 2, name: 'c' },
                { id: 1, name: 'd' },
            ];
            const source = enhanceListViewSource(
                new ListViewSource(
                    (_params) =>
                        of({
                            data: testData,
                            total: testData.length,
                        }),
                    {
                        orderings: [{ field: 'id', direction: OrderDirection.Asc }],
                    }
                )
            ).withMutableData({
                disableInMemorySorting: true,
            });

            source.pageData$.subscribe((page: any) => results.push(page));

            jest.runAllTimers();
            TestBed.flushEffects();

            source.pageDataSignal.update((data: any) => [
                ...data,
                {
                    id: 6,
                    name: 'f',
                },
                {
                    id: 7,
                    name: 'g',
                },
                {
                    id: 5,
                    name: 'e',
                },
            ]);

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([
                [
                    // First occurence is not sorted yet as it comes "from the server"
                    { id: 4, name: 'a' },
                    { id: 3, name: 'b' },
                    { id: 2, name: 'c' },
                    { id: 1, name: 'd' },
                ],
                [
                    { id: 4, name: 'a' },
                    { id: 3, name: 'b' },
                    { id: 2, name: 'c' },
                    { id: 1, name: 'd' },
                    { id: 6, name: 'f' },
                    { id: 7, name: 'g' },
                    { id: 5, name: 'e' },
                ],
            ]);
        });
    });

    it('should enhance with writable totalCountSignal', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const source = enhanceListViewSource(
                new ListViewSource(
                    (_params) =>
                        of({
                            data: [1, 2],
                            total: 2,
                        }),
                    {}
                )
            ).withMutableData();

            effect(() => {
                const total = source.totalCountSignal();
                results.push(total);
            });

            jest.runAllTimers();
            TestBed.flushEffects();

            source.totalCountSignal.set(3);

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([0, 2, 3]);
        });
    });

    it('should stream new value from page$ after totalCountSignal is set', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const source = enhanceListViewSource(
                new ListViewSource(
                    (_params) =>
                        of({
                            data: [1, 2],
                            total: 2,
                        }),
                    {}
                )
            ).withMutableData();

            source.page$.subscribe((page: any) => results.push(page));

            jest.runAllTimers();
            TestBed.flushEffects();

            source.totalCountSignal.set(3);

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([
                { data: [1, 2], total: 2 },
                { data: [1, 2], total: 3 },
            ]);
        });
    });

    it('should stream new value from page$ after totalCountSignal AND pageDataSignal is set', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const source = enhanceListViewSource(
                new ListViewSource(
                    (_params) =>
                        of({
                            data: [1, 2],
                            total: 2,
                        }),
                    {}
                )
            ).withMutableData();

            source.page$.subscribe((page: any) => results.push(page));

            jest.runAllTimers();
            TestBed.flushEffects();

            source.totalCountSignal.set(3);
            source.pageDataSignal.set([1, 2, 3]);

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([
                { data: [1, 2], total: 2 },
                { data: [1, 2], total: 3 },
                { data: [1, 2, 3], total: 3 },
            ]);
        });
    });
});
