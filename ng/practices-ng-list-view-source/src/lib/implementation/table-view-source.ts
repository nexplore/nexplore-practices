import { firstCharToLower } from '@nexplore/practices-ng-common-util';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
    IListResult,
    IOrdering,
    IQueryParams,
    IQueryParamsWithFilter,
    TableColumnDefinitions,
    TableColumnItem,
    TableViewSourceConfig,
} from '../types';
import { FilterableListViewSource } from './list-view-source';

/** Makes sure only one column has sortDir set */
function resetSortDir<TData>(column: TableColumnItem<TData>, columns: TableColumnItem<TData>[]) {
    if (column.sortDir != null) {
        columns.forEach((c) => {
            if (c !== column && c.sortDir != null) {
                c.sortDir = null;
            }
        });
    }
}

export function upsertTableColumn<TData>(columns: Array<TableColumnItem<TData>>, column: TableColumnItem<TData>) {
    const existingIndexByReference = columns.findIndex((d) => d === column);
    const existingIndexByFieldName = columns.findIndex((d) => column.fieldName && d.fieldName === column.fieldName);
    const existingIndex = existingIndexByReference !== -1 ? existingIndexByReference : existingIndexByFieldName;

    resetSortDir<TData>(column, columns);

    if (existingIndex !== -1) {
        const newArray = [...columns];
        newArray[existingIndex] = column;
        return newArray;
    } else {
        return [...columns, column];
    }
}

export function patchTableColumn<TData>(
    columns: Array<TableColumnItem<TData>>,
    column: TableColumnItem<TData> | string,
    partialUpdate: Partial<TableColumnItem<TData>>
) {
    const fieldName = typeof column === 'string' ? column : column.fieldName;

    const existingField =
        columns.find((d) => d === column) ?? columns.find((d) => fieldName && d.fieldName === fieldName);

    if (existingField) {
        Object.assign(existingField, partialUpdate);
        resetSortDir<TData>(existingField, columns);

        return { updatedArray: [...columns], updatedField: existingField };
    } else {
        const updatedField = Object.assign(typeof column === 'string' ? { fieldName: column } : column, partialUpdate);
        return { updatedArray: upsertTableColumn(columns, updatedField), updatedField };
    }
}

export class TableViewSource<TData, TFilter = TData>
    extends FilterableListViewSource<TData, TFilter>
    implements TableViewSourceConfig<TData>
{
    columnTranslationPrefix?: string;
    transformFieldForOrdering?: (field: string) => string;

    private _columnsArraySubject = new BehaviorSubject<TableColumnItem<TData>[] | null>(null);
    private _columnsMap: TableColumnDefinitions<TData> | null = null;

    set columns(val: TableColumnDefinitions<Partial<TData>> | Array<keyof TData> | TableColumnItem<TData>[]) {
        if (val instanceof Array) {
            val = val.map((item) =>
                typeof item === 'object' ? item : { fieldName: item }
            ) as TableColumnItem<TData>[];
            this._columnsArraySubject.next(val);
            this._columnsMap = {} as any;
            val.forEach((def) => {
                if (def.fieldName) {
                    this._columnsMap![def.fieldName] = def;
                }
            });
        } else {
            if (val) {
                this._columnsMap = val as TableColumnDefinitions<TData>;
                this._columnsArraySubject.next(
                    Object.entries(val).map(([fieldName, def]) => {
                        (def as any).fieldName = fieldName;
                        return def as TableColumnItem<any>;
                    })
                );
            } else {
                this._columnsMap = null;
                this._columnsArraySubject.next(null);
            }
        }
    }

    get columns(): TableColumnDefinitions<TData> {
        return this._columnsMap!;
    }

    get columnsArray(): Array<TableColumnItem<TData>> {
        return this._columnsArraySubject.value!;
    }

    readonly columnsArray$ = this._columnsArraySubject.asObservable().pipe(filter((d) => d != null));

    constructor(
        config: Omit<TableViewSourceConfig<TData>, 'columns'> & {
            columns: Array<keyof TData> | Array<TableColumnItem<TData>> | TableColumnDefinitions<Partial<TData>>;
        },
        loadFn: (params: IQueryParamsWithFilter<TFilter>) => Observable<IListResult<TData>>,
        public readonly defaults: Partial<IQueryParamsWithFilter<TFilter>> = {}
    ) {
        super(loadFn, { filter: {} as TFilter, ...defaults });
        Object.assign(this, config);
        this.columns = config.columns;
        this.patchSortableColumnWithDefaultOrdering(defaults);
    }

    protected override getQueryParams$(queryParams$: Observable<IQueryParams>): Observable<IQueryParams> {
        return combineLatest([queryParams$, this.columnsArray$]).pipe(
            map(([params, columnsArray]) => this._getParamsWithOrdering(params, columnsArray!))
        );
    }

    override getQueryParams(): IQueryParamsWithFilter<TFilter> {
        return this._getParamsWithOrdering(super.getQueryParams(), this.columnsArray);
    }

    upsertColumn(field: TableColumnItem<TData>) {
        this._columnsArraySubject.next(upsertTableColumn(this.columnsArray, field));

        if (field.fieldName) {
            this._columnsMap = { ...this._columnsMap, [field.fieldName]: field } as TableColumnDefinitions<TData>;
        }

        return field;
    }

    patchColumn(field: TableColumnItem<TData> | string, partialUpdate: Partial<TableColumnItem<TData>>) {
        const { updatedArray, updatedField } = patchTableColumn(this.columnsArray, field, partialUpdate);

        const fieldName = typeof field === 'string' ? field : field.fieldName;
        if (fieldName) {
            this._columnsMap = { ...this._columnsMap, [fieldName]: updatedField } as TableColumnDefinitions<TData>;
        }
        this._columnsArraySubject.next([...updatedArray]);

        return updatedField;
    }

    private patchSortableColumnWithDefaultOrdering(defaults: Partial<IQueryParamsWithFilter<TFilter>>) {
        if (defaults && defaults.orderings && defaults.orderings.length === 1) {
            const ordering = defaults.orderings[0];
            const orderingFieldNameNormalized = firstCharToLower(ordering.field);
            const existingColumn =
                this.columnsArray.find((c) => c.orderingFieldName === ordering.field) ?? // Try to find the field by the orderingFieldName
                this.columnsArray.find((c) => firstCharToLower(c.fieldName as string) === orderingFieldNameNormalized); // Fallback is to find the field by the fieldName
            if (existingColumn != null) {
                this.patchColumn(existingColumn, { sortDir: ordering.direction });
            }
        }
    }

    private _getParamsWithOrdering<T extends IQueryParams>(
        params: T | undefined,
        columnsArray: Array<TableColumnItem<TData>>
    ): T {
        const userDefinedOrderings =
            columnsArray.filter((d) => d.sortable && d.sortDir != null).map(this._getFieldOrdering) ?? [];
        const defaultOrderings = params?.orderings ?? [];

        return {
            ...(params as T),
            orderings: [...(userDefinedOrderings.length > 0 ? userDefinedOrderings : defaultOrderings)],
        };
    }

    private _getFieldOrdering = (columnDefinition: TableColumnItem<TData>): IOrdering => {
        let field = columnDefinition.fieldName as string;
        if (columnDefinition.orderingFieldName) {
            field = columnDefinition.orderingFieldName;
        } else if (this.transformFieldForOrdering) {
            field = this.transformFieldForOrdering(field);
        }

        return { field, direction: columnDefinition.sortDir! };
    };
}
