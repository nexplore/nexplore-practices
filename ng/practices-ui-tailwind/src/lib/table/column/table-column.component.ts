import { AsyncPipe, NgClass } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    Input,
    ViewChild,
    inject,
} from '@angular/core';
import { DestroyService, OrderDirection } from '@nexplore/practices-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs';

import { A11yModule } from '@angular/cdk/a11y';
import { PuiIconArrowComponent } from '../../icons/icon-arrow.component';
import { PuiIconSpinnerComponent } from '../../icons/icon-spinner.component';
import { setHostAttr, setHostClassNames } from '../../util/utils';
import { ClassNames } from '../constants';
import { TableColumnItem } from '../table-view-source';
import { PuiTableComponent } from '../table.component';
import {
    combineTranslationPrefixAndKey,
    sortDirToAriaSort,
    sortDirToIconDir,
    sortDirToLabelKey,
} from './table-column.util';

@Component({
    standalone: true,
    selector: 'pui-table-column',
    templateUrl: './table-column.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, AsyncPipe, TranslateModule, PuiIconArrowComponent, PuiIconSpinnerComponent, A11yModule],
    providers: [DestroyService],
})
export class PuiTableColumnComponent implements TableColumnItem<any>, AfterViewInit {
    private _table = inject(PuiTableComponent);
    private _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private _translate = inject(TranslateService);
    private _destroy$ = inject(DestroyService);

    @HostBinding('class')
    className = ClassNames.TABLE_COLUMN;

    @HostBinding('attr.role')
    role = 'columnheader';

    @ViewChild('contentWrapper', { static: false }) content: ElementRef<HTMLElement>;

    private _column: TableColumnItem<any> | null = null;

    @Input()
    set field(value: TableColumnItem<any> | string | undefined) {
        if (typeof value === 'string') {
            this.fieldName = value;
        } else if (typeof value === 'object') {
            this._column = value;
        }
    }

    get field(): TableColumnItem<any> {
        if (!this._column) {
            this._column = {};
        }
        return this._column;
    }

    @Input()
    set fieldName(val: string | number | symbol) {
        this._table?.patchColumn(this.field, { fieldName: val });
    }

    @Input()
    set sortable(val: boolean) {
        this._table?.patchColumn(this.field, { sortable: val });
    }

    @Input()
    set sortDir(val: OrderDirection) {
        this._table?.patchColumn(this.field, { sortDir: val });
    }

    @Input()
    set columnLabel(val: string) {
        this._table?.patchColumn(this.field, { columnLabel: val });
    }

    @Input()
    set orderingFieldName(val: string) {
        this._table?.patchColumn(this.field, { orderingFieldName: val });
    }

    @Input()
    align: 'center' | 'right' | 'left' = 'left';

    @Input() noPadding = false;

    private _column$ = this._table.columns$.pipe(
        map((_) => (this._column ? this._table.getColumn(this._column) : this.field)),
        shareReplay({ refCount: true, bufferSize: 1 }),
    );

    readonly label$ = this._column$.pipe(map((column) => this._translateTableColumnLabel(column)));

    readonly busy$ = this._table.tableViewSource$.pipe(switchMap((s) => s.busy$));

    readonly iconDir$ = this._column$.pipe(map((column) => sortDirToIconDir(column?.sortDir)));

    readonly sortDirLabel$ = this._column$.pipe(map((column) => this._translateSortDirLabel(column)));

    readonly clickToSortLabel$ = this._column$.pipe(map((column) => this._translateClickToSortLabel(column)));

    ngAfterViewInit(): void {
        setHostClassNames(
            {
                ['text-center']: this.align === 'center',
                ['text-right']: this.align === 'right',
                ['text-left']: this.align === 'left',
            },
            this.content,
        );

        setHostClassNames(
            {
                ['p-3']: !this.noPadding,
            },
            this._elementRef,
        );

        this._column$.pipe(takeUntil(this._destroy$)).subscribe((column) => {
            const ariaSort = sortDirToAriaSort(column?.sortDir);
            setHostAttr('aria-sort', ariaSort, this._elementRef);
        });
    }

    toggleDir() {
        if (this._column.sortable) {
            this.sortDir = this._column.sortDir === OrderDirection.Desc ? OrderDirection.Asc : OrderDirection.Desc;
            this._table.triggerInteractionEvent({ type: 'sort' });
        }
    }

    private _translateTableColumnLabel(column: TableColumnItem<any>) {
        if (this._column?.columnLabel) {
            return this._column.columnLabel;
        } else if (this._column?.columnLabelKey) {
            return this._translate.instant(this._column.columnLabelKey, this._column.columnLabelKeyParams);
        } else {
            const key = combineTranslationPrefixAndKey(
                this._table.columnTranslationPrefix ?? this._table.tableViewSource?.columnTranslationPrefix,
                column.fieldName as string,
            );

            if (key) {
                return this._translate.instant(key);
            } else {
                return this._column?.fieldName;
            }
        }
    }

    private _translateSortDirLabel(column: TableColumnItem<any>): string | null {
        if (column?.sortDir === undefined || column?.sortDir === null) {
            return null;
        }

        return this._translate.instant(sortDirToLabelKey(column.sortDir));
    }

    private _translateClickToSortLabel(column: TableColumnItem<any>): string {
        return column?.sortable
            ? this._translate.instant('Practices.Labels_Table_ClickToSort', {
                  dir: this._translate.instant(
                      sortDirToLabelKey(
                          column?.sortDir === OrderDirection.Asc ? OrderDirection.Desc : OrderDirection.Asc,
                      ),
                  ),
              })
            : '';
    }
}

