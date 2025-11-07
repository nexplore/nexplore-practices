import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it, jest } from '@jest/globals';
import { command } from '@nexplore/practices-ng-commands';
import { of } from 'rxjs';
import { OrderDirection, tableViewSource } from './api';
import { createListResultFromArray } from './utils/list-result-util';

describe('tableViewSource', () => {
    it('should have fromCommand', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(
                    public name: string,
                    public age: number,
                ) {}
            }

            const cmd = command.action(() => [new TestDto('Test', 22)]);

            const vs = tableViewSource.fromCommand(cmd, {
                columns: ['name', 'age'],
                orderBy: 'name',
            });

            expect(vs).toBeDefined();
        });
    });

    it('should have extensions defined', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(
                    public name: string,
                    public age: number,
                ) {}
            }

            const filterForm = new FormGroup({
                name: new FormControl(''),
            });

            const vs = tableViewSource
                .withType({
                    type: TestDto,
                    columns: ['name', 'age'],
                    loadFn: () => of(createListResultFromArray([new TestDto('Test', 22)])),
                    orderBy: 'name',
                })
                .withPersistedParams({
                    persistParams: {
                        load: () => ({
                            filter: null,
                            orderings: [{ field: 'name', direction: OrderDirection.Asc }],
                        }),
                        save: () => {},
                    },
                })
                .withFilterForm({ filterForm });

            expect(vs).toBeDefined();
        });
    });
});

