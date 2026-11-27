import { AsyncPipe, NgClass, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    forwardRef,
    HostBinding,
    Input,
    QueryList,
    TemplateRef,
    Type,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';
import { DestroyService, StatusProgressOptions, StatusService } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, filter, map, merge, of, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { PuibeIconSpinnerComponent } from '../icons/icon-spinner.component';
import { setHostClassNames } from '../util/utils';
import { PuibeTableColumnComponent } from './column/table-column.component';
import { CssGridSize } from './constants';
import { PageService } from './pagination/page.service';
import { patchTableColumn, TableColumnItem, TableViewSource, TableViewSourceConfig } from './table-view-source';

export interface ColumnTemplate {
    componentType?: Type<any>;
    template?: TemplateRef<any>;
    hideInRow?: boolean;
    hideInHeader?: boolean;
    noPadding?: boolean;
    /** The CSS grid track size of the column, only used if the table has `useGridLayout` enabled. Defaults to `'auto'`. */
    size?: CssGridSize;
}

export type TableInteractionEvent =
    | { type: 'sort' }
    | { type: 'page'; number: number }
    | { type: 'page-size'; number: number }
    | { type: 'filter' };

@Component({
    standalone: true,
    selector: 'puibe-table',
    templateUrl: './table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PageService, DestroyService],
    styleUrls: ['./table.component.css'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgClass,
        AsyncPipe,
        TranslateModule,
        NgTemplateOutlet,
        NgComponentOutlet,
        PuibeIconSpinnerComponent,
        forwardRef(() => PuibeTableColumnComponent),
    ],
})
export class PuibeTableComponent implements Partial<TableViewSourceConfig<any>>, AfterViewInit {
    private readonly _useGridLayoutSubject = new BehaviorSubject<boolean>(false);
    private readonly _gridLayoutUpdateSubject = new Subject<void>();
    private _beforeColumnTemplate = new BehaviorSubject<ColumnTemplate>(null);
    private readonly _defaultTableColumnsSubject = new BehaviorSubject<Array<TableColumnItem<any>>>([]);
    private readonly _tableViewSourceSubject = new BehaviorSubject<TableViewSource<any>>(null);
    private readonly _interactionEventsSubject = new Subject<TableInteractionEvent>();
    private readonly _statusOptionsSubject = new BehaviorSubject<StatusProgressOptions>(null);

    @HostBinding('class')
    readonly className = 'border-collapse border-spacing-0 transition-all duration-150';

    @HostBinding('attr.role')
    @Input()
    role = 'table';

    @Input()
    columnTranslationPrefix: string;

    /**
     * EXPERIMENTAL: Renders the table using CSS grid (with subgrid rows) instead of the default `display: table` layout.
     *
     * The column sizes are defined by the `size` input of each `puibe-table-column` (e.g. `'auto'`, `'1fr'`, `'8rem'` or `'minmax(8rem, 1fr)'`).
     * Columns without a `size` try to derive one from tailwind width classes (`w-full`, `w-1/4`, ...) and fall back to `'auto'`.
     * The whole template can also be overridden with a `grid-template-columns` style or a tailwind `grid-cols-*` class on the table.
     */
    @Input()
    set useGridLayout(value: boolean) {
        this._useGridLayoutSubject.next(!!value);
    }

    get useGridLayout() {
        return this._useGridLayoutSubject.value;
    }

    /** Makes the table header stick to the top of the scroll container. */
    @Input()
    useStickyHeader = false;

    /** Makes the table footer stick to the bottom of the scroll container. Can also be set on the `puibe-table-footer` with the `sticky` input. */
    @Input()
    useStickyFooter = false;

    @Input()
    set beforeColumnTemplate(value: ColumnTemplate) {
        this._beforeColumnTemplate.next(value);
    }

    @Input()
    set tableViewSource(value: TableViewSource<any>) {
        if (this._defaultTableColumnsSubject.value?.length) {
            value.columns = this._defaultTableColumnsSubject.value;
        }
        this._tableViewSourceSubject.next(value);
    }

    get tableViewSource() {
        return this._tableViewSourceSubject.value;
    }

    /**
     * Options for the status service, specifiying how `tableViewSource` is registered.
     */
    @Input()
    set statusOptions(value: StatusProgressOptions) {
        this._statusOptionsSubject.next(value);
    }

    @Input()
    showBusyAnimation = true;

    @Input()
    noItemsMessage: string | undefined = undefined;

    readonly beforeColumnTemplate$ = this._beforeColumnTemplate.asObservable();

    readonly useGridLayout$ = this._useGridLayoutSubject.asObservable();

    readonly tableViewSource$ = combineLatest([this._tableViewSourceSubject, this._statusOptionsSubject]).pipe(
        filter(([viewSource, _]) => !!viewSource),
        switchMap(([viewSource, options]) => this._statusService.registerListViewSource$(viewSource, options)) // TODO: List view source should auto register using fluent builder api
    );

    readonly columns$ = combineLatest([
        this.tableViewSource$.pipe(
            switchMap((s) => s.columnsArray$), // Make sure we have the latest version of the columns
            startWith(null) // We need to start with null, so that the default value below will be used as a fallback
        ),
        this._defaultTableColumnsSubject.asObservable(),
    ]).pipe(map(([cur, def]) => cur ?? def ?? []));

    readonly busy$ = this.tableViewSource$.pipe(switchMap((s) => s.busy$));

    readonly noItems$ = this.tableViewSource$.pipe(
        switchMap((s) => s.pageData$),
        map((pageData) => !pageData?.length),
        startWith(undefined)
    );

    readonly busyAndNoItems$ = combineLatest([this.busy$, this.noItems$]).pipe(
        map(([busy, noItems]) => busy && (noItems || noItems === undefined))
    );

    readonly itemsCount$ = this.tableViewSource$.pipe(
        switchMap((s) => s.pageData$),
        map((pageData) => pageData?.length),
        startWith(undefined)
    );

    readonly eventNotificationTranslationKeys$ = this._interactionEventsSubject.pipe(
        map((event) => {
            switch (event.type) {
                case 'sort':
                    return { key: 'Practices.Labels_Table_Notification_Sort', ...event };
                case 'page':
                    return { key: 'Practices.Labels_Table_Notification_Page', ...event };
                case 'page-size':
                    return { key: 'Practices.Labels_Table_Notification_PageSize', ...event };
                case 'filter':
                    return { key: 'Practices.Labels_Table_Notification_Filter', ...event };
            }
        })
    );

    @ContentChildren(forwardRef(() => PuibeTableColumnComponent))
    protected readonly columnContentComponents: QueryList<PuibeTableColumnComponent>;

    @ViewChildren(forwardRef(() => PuibeTableColumnComponent))
    protected readonly columnViewComponents: QueryList<PuibeTableColumnComponent>;

    @HostBinding('class.table')
    protected get isTableLayout() {
        return !this.useGridLayout;
    }

    @HostBinding('class.grid')
    protected get isGridLayout() {
        return this.useGridLayout;
    }

    constructor(
        private _destroy$: DestroyService,
        private _elementRef: ElementRef<HTMLElement>,
        private _statusService: StatusService
    ) {
        this.busy$.pipe(takeUntil(this._destroy$)).subscribe((busy) => {
            setHostClassNames(
                {
                    'animate-pulse': busy && this.showBusyAnimation,
                },
                this._elementRef
            );
        });

        this.tableViewSource$
            .pipe(
                switchMap((s) => s.filter$),
                takeUntil(this._destroy$)
            )
            .subscribe((_filter) => {
                this.triggerInteractionEvent({ type: 'filter' });
            });
    }

    ngAfterViewInit() {
        // The view children (the column of the `beforeColumnTemplate`) are always rendered before the content children.
        this._useGridLayoutSubject
            .pipe(
                switchMap((useGridLayout) =>
                    useGridLayout
                        ? merge(
                              of(null),
                              this.columnViewComponents.changes,
                              this.columnContentComponents.changes,
                              this._gridLayoutUpdateSubject
                          ).pipe(map(() => [...this.columnViewComponents, ...this.columnContentComponents]))
                        : of(null)
                ),
                takeUntil(this._destroy$)
            )
            .subscribe((columns) => this._applyGridTemplateColumns(columns));
    }

    /**
     * Recalculates the CSS grid column template (Only relevant if `useGridLayout` is enabled).
     * @internal Called by the columns when their size changes.
     */
    updateGridLayout() {
        this._gridLayoutUpdateSubject.next();
    }

    triggerInteractionEvent(event: TableInteractionEvent) {
        this._interactionEventsSubject.next(event);
    }

    patchColumn(column: TableColumnItem<any> | string, partialUpdate: Partial<TableColumnItem<any>>) {
        this.tableViewSource?.patchColumn(column, partialUpdate);
        this._defaultTableColumnsSubject.next(
            patchTableColumn(this._defaultTableColumnsSubject.value, column, partialUpdate).updatedArray
        );
    }

    getColumn(column: TableColumnItem<any>) {
        if (!column) {
            return column ?? {};
        }

        let existingColumn: TableColumnItem<any>;
        if (this.tableViewSource) {
            existingColumn = column.fieldName
                ? this.tableViewSource?.columns[column.fieldName as string]
                : this.tableViewSource.columnsArray.find((c) => c === column);
        } else {
            existingColumn =
                this._defaultTableColumnsSubject.value.find((c) => c === column) ??
                this._defaultTableColumnsSubject.value.find(
                    (c) => column.fieldName && c.fieldName === column.fieldName
                );
        }

        return existingColumn ?? column;
    }

    private _applyGridTemplateColumns(columns: PuibeTableColumnComponent[] | null) {
        const style = this._elementRef.nativeElement.style;
        if (columns) {
            style.setProperty('--puibe-table-cols-template', columns.map((c) => c.gridSize).join(' ') || 'auto');
        } else {
            style.removeProperty('--puibe-table-cols-template');
        }
    }
}
