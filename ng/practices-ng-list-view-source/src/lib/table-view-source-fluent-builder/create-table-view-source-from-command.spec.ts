import { TestBed } from '@angular/core/testing';
import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { command } from '@nexplore/practices-ng-commands';
import { createTableViewSourceFromCommand } from './create-table-view-source-from-command';

describe('fromCommand', () => {
    class TestDto {
        constructor(public name: string, public age: number) {}
    }

    beforeAll(() => {
        jest.useFakeTimers();
    });

    it('should create table view source from command', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(public name: string, public age: number) {}
            }

            const cmd = command.action(() => [new TestDto('Test', 22)]);

            const vs = createTableViewSourceFromCommand(cmd, {
                columns: ['name', 'age'],
                orderBy: 'name',
            });

            expect(vs).toBeDefined();
        });
    });

    it('should update table view source pageData$ when command triggered and receives new result', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const cmd = command.action((count: number) =>
                Array.from({ length: count }, (_, i) => new TestDto(`Test ${i}`, i))
            );

            const vs = createTableViewSourceFromCommand(cmd, {
                columns: ['name', 'age'],
                orderBy: 'name',
            });

            vs.pageData$.subscribe((data) => results.at(-1)?.length !== data?.length && results.push(data));
            jest.runAllTimers();
            TestBed.flushEffects();

            cmd.trigger(1);
            jest.runAllTimers();
            TestBed.flushEffects();

            cmd.trigger(3);
            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results.map((r) => r.length)).toEqual([0, 1, 3]);
        });
    });

    it('should by default NOT trigger the command when the view source is created', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const cmd = command.action((count: number) =>
                Array.from({ length: count }, (_, i) => new TestDto(`Test ${i}`, i))
            );
            cmd.triggered$.subscribe(() => results.push('triggered'));

            createTableViewSourceFromCommand(cmd, {
                columns: ['name', 'age'],
                orderBy: 'name',
            });

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([]);
        });
    });

    it('should by default NOT trigger the command when refresh is called', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const cmd = command.action((count: number) =>
                Array.from({ length: count }, (_, i) => new TestDto(`Test ${i}`, i))
            );
            cmd.triggered$.subscribe(() => results.push('triggered'));

            const vs = createTableViewSourceFromCommand(cmd, {
                columns: ['name', 'age'],
                orderBy: 'name',
            });

            vs.refresh();
            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual([]);
        });
    });

    it('should trigger the command when refresh is called and triggerQueryCommandWithFilter is true', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const cmd = command.action((count: number) =>
                Array.from({ length: count }, (_, i) => new TestDto(`Test ${i}`, i))
            );
            cmd.triggered$.subscribe(() => results.push('triggered'));

            const vs = createTableViewSourceFromCommand(cmd, {
                columns: ['name', 'age'],
                orderBy: 'name',
                triggerQueryCommandWithFilter: true,
            });

            vs.filter(3);

            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results).toEqual(['triggered']);
        });
    });

    it('should update table view source data when command is configured withMutableResult', () => {
        TestBed.runInInjectionContext(() => {
            const results: any[] = [];

            const cmd = command.query
                .withManualTrigger((count: number) =>
                    Array.from({ length: count }, (_, i) => new TestDto(`Test ${i}`, i))
                )
                .withMutableResult();

            const vs = createTableViewSourceFromCommand(cmd, {
                columns: ['name', 'age'],
                orderBy: 'name',
            });

            vs.pageData$.subscribe((data) => results.at(-1)?.length !== data?.length && results.push(data));
            jest.runAllTimers();
            TestBed.flushEffects();

            cmd.trigger(1);
            jest.runAllTimers();
            TestBed.flushEffects();

            cmd.resultSignal.set([new TestDto('Test 1', 1), new TestDto('Test 2', 2), new TestDto('Test 3', 3)]);
            jest.runAllTimers();
            TestBed.flushEffects();

            expect(results.map((r) => r.length)).toEqual([0, 1, 3]);
        });
    });
});
