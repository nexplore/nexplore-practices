import { AsyncPipe, NgClass, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, HostBinding, Input, TemplateRef, Type, inject } from '@angular/core';
import { DestroyService, StatusProgressOptions, StatusService } from '@nexplore/practices-ui';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, filter, map, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { PuibeIconSpinnerComponent } from '../icons/icon-spinner.component';
import { setHostClassNames } from '../util/utils';
import { PuibeTableColumnComponent } from './column/table-column.component';
import { ClassNames } from './constants';
import { PageService } from './pagination/page.service';
import { patchTableColumn, TableColumnItem, TableViewSource, TableViewSourceConfig } from './table-view-source';

export interface ColumnTemplate {
    componentType?: Type<any>;
    template?: TemplateRef<any>;
    hideInRow?: boolean;
    hideInHeader?: boolean;
    noPadding?: boolean;
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
    imports: [
    NgClass,
    AsyncPipe,
    TranslateModule,
    NgTemplateOutlet,
    NgComponentOutlet,
    PuibeIconSpinnerComponent,
    forwardRef(() => PuibeTableColumnComponent)
],
})
export class PuibeTableComponent implements Partial<TableViewSourceConfig<any>> {
    private _destroy$ = inject(DestroyService);
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private _statusService = inject(StatusService);

    private _beforeColumnTemplate = new BehaviorSubject<ColumnTemplate>(null);
    private readonly _defaultTableColumnsSubject = new BehaviorSubject<Array<TableColumnItem<any>>>([]);
    private readonly _tableViewSourceSubject = new BehaviorSubject<TableViewSource<any>>(null);
    private readonly _interactionEventsSubject = new Subject<TableInteractionEvent>();
    private readonly _statusOptionsSubject = new BehaviorSubject<StatusProgressOptions>(null);

    @HostBinding('class')
    readonly className = 'table border-collapse border-spacing-0 transition-all duration-150';

    readonly headerCellClassName = ClassNames.TABLE_COLUMN;

    @HostBinding('attr.role')
    @Input()
    role = 'table';

    @Input()
    columnTranslationPrefix: string;

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

    constructor() {
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
}
