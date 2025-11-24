import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { command } from '@nexplore/practices-ng-commands';
import { of } from 'rxjs';
import { IOrdering, OrderDirection, selectViewSource, tableViewSource } from './api';
import { createListResultFromArray } from './utils/list-result-util';

describe('tableViewSource', () => {
    it('should have fromCommand', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(public name: string, public age: number) {}
            }

            const cmd = command.action(() => [new TestDto('Test', 22)]);

            const vs = tableViewSource.fromCommand(cmd, {
                columns: ['name', 'age'],
                orderBy: 'name',
            });

            expect(vs).toBeDefined();
        });
    });

    it('should have fromCommand with separate config', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(public name: string, public age: number) {}
            }

            const cmd = command.action(() => [new TestDto('Test', 22)]);

            const vs = tableViewSource.fromCommand(cmd).withConfig({
                columns: ['name', 'age'],
                orderBy: 'name',
                sortInMemory: true,
            });

            expect(vs).toBeDefined();
        });
    });

    it('should have fromCommand with separate config / withPersistedParams', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(public name: string, public age: number) {}
            }

            const cmd = command.action(() => [new TestDto('Test', 22)]);

            const vs = tableViewSource.fromCommand(cmd).withPersistedParams({
                columns: ['name', 'age'],
                persistParams: {
                    load: () => ({
                        filter: null,
                        orderings: [],
                    }),
                    save: () => {},
                },
                orderBy: 'name',
                sortInMemory: true,
            });

            expect(vs).toBeDefined();
        });
    });

    it('should have fromCommand with separate config / withFilterForm', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(public name: string, public age: number) {}
            }

            const cmd = command.action((_params: { nameFilter: string }) => [new TestDto('Test', 22)]);

            const form = new FormGroup({
                nameFilter: new FormControl('', { nonNullable: true }),
            });

            const vs = tableViewSource.fromCommand(cmd).withFilterForm({
                columns: ['name', 'age'],
                filterForm: form,
                orderBy: 'name',
                triggerQueryCommandWithFilter: true,
            });

            expect(vs).toBeDefined();
        });
    });

    it('should have fromCommand with separate config / withFilterForm after', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(public name: string, public age: number) {}
            }

            const cmd = command.action((_params: { nameFilter: string }) => [new TestDto('Test', 22)]);

            const form = new FormGroup({
                nameFilter: new FormControl('', { nonNullable: true }),
            });

            const vs = tableViewSource
                .fromCommand(cmd)
                .withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                    triggerQueryCommandWithFilter: true,
                })
                .withFilterForm({
                    filterForm: form,
                });

            expect(vs).toBeDefined();
        });
    });

    it('should have fromData', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(public name: string, public age: number) {}
            }

            const vs = tableViewSource
                .fromData((_params) =>
                    of({
                        data: [new TestDto('Test', 22)],
                        total: 1,
                    })
                )
                .withConfig({
                    columns: ['name', 'age'],
                    orderBy: 'name',
                });

            expect(vs).toBeDefined();
        });
    });

    it('should have extensions defined', () => {
        TestBed.runInInjectionContext(() => {
            class TestDto {
                constructor(public name: string, public age: number) {}
            }

            const filterForm = new FormGroup({
                name: new FormControl(''),
            });

            const vs = tableViewSource
                .fromData(() => of(createListResultFromArray([new TestDto('Test', 22)])))
                .withConfig({
                    columns: ['name', 'age'],
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

    it('should create tableViewSource with basic config', () => {
        TestBed.runInInjectionContext(() => {
            const source = tableViewSource.withConfig({
                loadFn: (_params) =>
                    of({
                        data: [
                            { name: 'John', department: 'IT', salary: 50000, id: 1 },
                            { name: 'Jane', department: 'HR', salary: 45000, id: 2 },
                        ],
                        total: 2,
                    }),
                columns: {
                    name: { sortable: true },
                    department: { sortable: true },
                    salary: { sortable: false },
                },
                orderBy: 'name',
            });

            expect(source).toBeDefined();
            expect(source.columnsArray).toBeDefined();
            expect(source.columnsArray.length).toBe(3);
        });
    });

    it('should create tableViewSource with type and basic config', () => {
        TestBed.runInInjectionContext(() => {
            interface Employee {
                id: number;
                firstName: string;
                lastName: string;
                department: string;
                hireDate: Date;
            }

            const source = tableViewSource.withType<Employee>().withConfig({
                loadFn: (_params) =>
                    of({
                        data: [
                            { id: 1, firstName: 'John', lastName: 'Doe', department: 'IT', hireDate: new Date() },
                            { id: 2, firstName: 'Jane', lastName: 'Smith', department: 'HR', hireDate: new Date() },
                        ],
                        total: 2,
                    }),
                columns: {
                    firstName: { sortable: true },
                    lastName: { sortable: true },
                    department: { sortable: true },
                },
                orderBy: 'lastName',
            });

            expect(source).toBeDefined();
            expect(source.columnsArray).toBeDefined();
            expect(source.columnsArray.length).toBe(3);
        });
    });

    it('should create typed tableViewSource with column configurations', () => {
        TestBed.runInInjectionContext(() => {
            class Task {
                constructor(
                    public title: string,
                    public status: string,
                    public priority: number,
                    public createdDate: Date
                ) {}
            }

            const source = tableViewSource.withType({
                type: Task,
                loadFn: (_params) =>
                    of({
                        data: [new Task('Task 1', 'Open', 1, new Date()), new Task('Task 2', 'Closed', 2, new Date())],
                    }),
                columns: {
                    title: {
                        sortable: true,
                        columnLabel: 'Task Title',
                        orderingFieldName: 'TaskTitle',
                    },
                    status: {
                        sortable: true,
                        columnLabelKey: 'task.status',
                    },
                    priority: { sortable: false },
                    createdDate: {
                        sortable: true,
                        sortDir: OrderDirection.Desc,
                    },
                },
                columnTranslationPrefix: 'tasks',
                orderBy: 'title',
            });

            expect(source).toBeDefined();
            expect(source.columnsArray.length).toBe(4);

            const titleColumn = source.columnsArray.find((c: any) => c.fieldName === 'title');
            expect(titleColumn?.columnLabel).toBe('Task Title');
            expect(titleColumn?.orderingFieldName).toBe('TaskTitle');

            const statusColumn = source.columnsArray.find((c: any) => c.fieldName === 'status');
            expect(statusColumn?.columnLabelKey).toBe('task.status');
        });
    });

    it('should create tableViewSource with filter form', () => {
        TestBed.runInInjectionContext(() => {
            class Order {
                constructor(public orderNumber: string, public customerName: string, public amount: number) {}
            }

            const filterForm = new FormGroup({
                orderNumber: new FormControl(''),
                customerName: new FormControl(''),
                minAmount: new FormControl(0),
            });

            const source = tableViewSource.withType<Order>().withFilterForm({
                filterForm,
                loadFn: (_params) =>
                    of({
                        data: [new Order('ORD001', 'Alice', 100), new Order('ORD002', 'Bob', 200)],
                    }),
                columns: {
                    orderNumber: { sortable: true },
                    customerName: { sortable: true },
                    amount: { sortable: true },
                },
                orderBy: 'orderNumber',
            });

            expect(source).toBeDefined();
        });
    });

    it('should create tableViewSource with persisted params', () => {
        TestBed.runInInjectionContext(() => {
            class Invoice {
                constructor(public invoiceId: string, public date: Date, public total: number) {}
            }

            const source = tableViewSource.withType<Invoice>().withPersistedParams({
                loadFn: (_params) =>
                    of({
                        data: [new Invoice('INV001', new Date(), 500), new Invoice('INV002', new Date(), 750)],
                    }),
                columns: {
                    invoiceId: { sortable: true },
                    date: { sortable: true },
                    total: { sortable: true },
                },
                orderBy: 'invoiceId',
                persistParams: {
                    load: () => ({
                        filter: {},
                        orderings: [{ field: 'date', direction: OrderDirection.Desc }],
                        skip: 0,
                        take: 25,
                    }),
                    save: (params: any) => {
                        // Mock save implementation
                        console.log('Saving params:', params);
                    },
                },
            });

            expect(source).toBeDefined();
        });
    });

    it('should support untypedOrdering with tableViewSource', () => {
        TestBed.runInInjectionContext(() => {
            function untypedOrdering(ordering: IOrdering): any {
                return ordering;
            }

            class Report {
                constructor(public title: string, public id: number) {}
            }

            const source = tableViewSource.withType({
                type: Report,
                loadFn: (_params: any) =>
                    of({
                        data: [new Report('Monthly Report', 1), new Report('Weekly Report', 2)],
                    }),
                columns: {
                    title: { sortable: true },
                    id: { sortable: true },
                },
                orderBy: untypedOrdering({ field: 'ServerGeneratedField', direction: OrderDirection.Desc }),
            });

            expect(source).toBeDefined();
        });
    });

    describe('optional columns', () => {
        it('should accept config without columns property', () => {
            TestBed.runInInjectionContext(() => {
                const vs = tableViewSource.withConfig({
                    loadFn: (_params) =>
                        of({
                            data: [
                                { name: 'John', department: 'IT', salary: 50000, id: 1 },
                                { name: 'Jane', department: 'HR', salary: 45000, id: 2 },
                            ],
                            total: 2,
                        }),
                    orderBy: 'name',
                });

                expect(vs).toBeDefined();
            });
        });

        it('should fallback to empty array when columns not provided', () => {
            TestBed.runInInjectionContext(() => {
                const vs = tableViewSource.withConfig({
                    loadFn: (_params) =>
                        of({
                            data: [
                                { name: 'John', department: 'IT', salary: 50000, id: 1 },
                                { name: 'Jane', department: 'HR', salary: 45000, id: 2 },
                            ],
                            total: 2,
                        }),
                    orderBy: 'name',
                });

                expect(vs.columnsArray).toEqual([]);
            });
        });

        it('should not break when filtering with no columns', () => {
            TestBed.runInInjectionContext(() => {
                const vs = tableViewSource.withConfig({
                    loadFn: (_params) =>
                        of({
                            data: [
                                { name: 'John', department: 'IT', salary: 50000, id: 1 },
                                { name: 'Jane', department: 'HR', salary: 45000, id: 2 },
                            ],
                            total: 2,
                        }),
                    orderBy: 'name',
                });

                expect(() => {
                    vs.filter({ name: 'John' });
                }).not.toThrow();
            });
        });

        it('should not break when sorting with no columns', () => {
            TestBed.runInInjectionContext(() => {
                const vs = tableViewSource.withConfig({
                    loadFn: (_params) =>
                        of({
                            data: [
                                { name: 'John', department: 'IT', salary: 50000, id: 1 },
                                { name: 'Jane', department: 'HR', salary: 45000, id: 2 },
                            ],
                            total: 2,
                        }),
                    orderBy: 'name',
                });

                expect(() => {
                    vs.update({ orderings: [{ field: 'name', direction: 0 }] });
                }).not.toThrow();
            });
        });

        it('should work with fromData when columns not provided', () => {
            TestBed.runInInjectionContext(() => {
                const testData = [
                    { name: 'John', department: 'IT', salary: 50000, id: 1 },
                    { name: 'Jane', department: 'HR', salary: 45000, id: 2 },
                ];

                const vs = tableViewSource
                    .fromData((_params) => of({ data: testData, total: testData.length }))
                    .withConfig({
                        orderBy: 'name',
                    });

                expect(vs).toBeDefined();
                expect(vs.columnsArray).toEqual([]);
            });
        });
    });
});

describe('selectViewSource', () => {
    it('should support selectViewSource with untypedOrdering for server-only fields', () => {
        function untypedOrdering(ordering: IOrdering): any {
            return ordering;
        }

        class Item {
            constructor(public label: string, public id: number) {}
        }

        const fetchItems = (
            label: string,
            _skip?: number,
            _take?: number,
            _orderings?: any,
            _includeTotal?: boolean
        ) => {
            return [{ id: 1, label: label }];
        };

        TestBed.runInInjectionContext(() => {
            const source = selectViewSource.withType<Item>().withConfig({
                searchable: true,
                label: 'label',
                loadFn: (params) =>
                    of({
                        data: fetchItems(
                            params.filter.label,
                            params.skip,
                            params.take,
                            params.orderings,
                            params.includeTotal
                        ),
                    }),
                orderBy: untypedOrdering({ field: 'ServerField', direction: OrderDirection.Asc }),
            });

            expect(source).toBeDefined();
            expect(source.label).toBe('label');
            expect(source.searchable).toBe(true);
        });
    });

    it('should create selectViewSource from command', () => {
        TestBed.runInInjectionContext(() => {
            class Product {
                constructor(public name: string, public id: number, public price: number) {}
            }

            const cmd = command.action(() => [new Product('Product A', 1, 100), new Product('Product B', 2, 200)]);

            const source = selectViewSource.fromCommand(cmd, {
                label: 'name',
                searchable: true,
                sortInMemory: true,
            });

            expect(source).toBeDefined();
            expect(source.label).toBe('name');
            expect(source.searchable).toBe(true);
        });
    });

    it('should create selectViewSource from command without config', () => {
        TestBed.runInInjectionContext(() => {
            class Product {
                constructor(public name: string, public id: number, public price: number) {}
            }

            const cmd = command.action(() => [new Product('Product A', 1, 100), new Product('Product B', 2, 200)]);

            const source = selectViewSource.fromCommand(cmd);

            expect(source).toBeDefined();
        });
    });

    it('should create selectViewSource with basic config', () => {
        TestBed.runInInjectionContext(() => {
            class Category {
                constructor(public title: string, public id: number) {}
            }

            const source = selectViewSource.withConfig({
                label: 'title',
                value: 'id',
                searchable: false,
                localSearch: true,
                loadFn: (_params) =>
                    of({
                        data: [new Category('Electronics', 1), new Category('Books', 2)],
                        total: 2,
                    }),
                orderBy: 'title',
            });

            expect(source).toBeDefined();
            expect(source.label).toBe('title');
            expect(source.value).toBe('id');
            expect(source.searchable).toBe(false);
            expect(source.localSearch).toBe(true);
        });
    });

    it('should create typed selectViewSource with complex config', () => {
        TestBed.runInInjectionContext(() => {
            interface User {
                username: string;
                id: number;
                email: string;
                isActive: boolean;
            }

            const source = selectViewSource.withType<User>().withConfig({
                label: 'username',
                value: 'id',
                searchable: true,
                loadFn: (params) =>
                    of({
                        data: [
                            { username: 'john', id: 1, email: 'john@test.com', isActive: true },
                            { username: 'jane', id: 2, email: 'jane@test.com', isActive: false },
                        ].filter((u) => !params.filter['username'] || u.username.includes(params.filter['username'])),
                        total: 2,
                    }),
                defaultQueryParams: {
                    filter: { username: '' },
                    skip: 0,
                    take: 50,
                    orderings: [{ field: 'username', direction: OrderDirection.Asc }],
                },
            });

            expect(source).toBeDefined();
            expect(source.label).toBe('username');
            expect(source.value).toBe('id');
        });
    });

    it('should support different label and value properties', () => {
        TestBed.runInInjectionContext(() => {
            interface Option {
                displayName: string;
                code: string;
                description: string;
            }

            const source = selectViewSource.withType<Option>().withConfig({
                label: 'displayName',
                value: 'code',
                searchable: true,
                loadFn: (_params) =>
                    of({
                        data: [
                            { displayName: 'Option One', code: 'OPT1', description: 'First option' },
                            { displayName: 'Option Two', code: 'OPT2', description: 'Second option' },
                        ],
                    }),
                orderBy: 'displayName',
            });

            expect(source).toBeDefined();
            expect(source.label).toBe('displayName');
            expect(source.value).toBe('code');
        });
    });

    it('should handle non-searchable select with local search', () => {
        TestBed.runInInjectionContext(() => {
            interface Status {
                name: string;
                id: number;
            }

            const source = selectViewSource.withType<Status>().withConfig({
                label: 'name',
                searchable: false,
                localSearch: true,
                loadFn: (_params) =>
                    of({
                        data: [
                            { name: 'Active', id: 1 },
                            { name: 'Inactive', id: 2 },
                            { name: 'Pending', id: 3 },
                        ],
                    }),
                orderBy: 'name',
            });

            expect(source).toBeDefined();
            expect(source.searchable).toBe(false);
            expect(source.localSearch).toBe(true);
        });
    });
});
