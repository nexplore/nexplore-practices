import { AfterViewInit, Directive, Input, inject } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { PuiTableComponent } from '../table.component';
import { PuiTableColumnComponent } from './table-column.component';

/**
 * The directive adds the ability to translate the column label by its content.
 * Example:
 * ```
 * <pui-table-column translate>Labels.xyz</pui-table-column>
 * ```
 *
 * Notice: This directive is a workaround for the fact that the ngx translate directive does not properly work on the slotted content of a component.
 */
@Directive({
    selector: 'pui-table-column[translate]',
    standalone: true,
    providers: [DestroyService],
})
export class PuiTableColumnTranslateDirective implements AfterViewInit {
    private _table = inject(PuiTableComponent);
    private _columnComponent = inject(PuiTableColumnComponent);
    private _translate = inject(TranslateService);
    private _destroy = inject(DestroyService);

    @Input() translate: string;

    @Input()
    set translateParams(value: any) {
        this._table?.patchColumn(this._columnComponent.field, { columnLabelKeyParams: value });
    }

    ngAfterViewInit(): void {
        // If the columnLabelKey is set to empty string, it means the `translate` input was set without an parameter, like
        // `<pui-table-column translate>Labels.xyz</pui-table-column>`.
        // This means we need to translate the content of the column.
        if (this.translate === '' && this._columnComponent.content?.nativeElement?.textContent) {
            // Set the translate key to the content of the column.
            const columnLabelKey = this._columnComponent.content.nativeElement.textContent.trim();

            this._translate
                .get(columnLabelKey)
                .pipe(takeUntil(this._destroy))
                .subscribe((columnLabel) => {
                    this._columnComponent.content.nativeElement.innerText = columnLabel;
                });

            this._table?.patchColumn(this._columnComponent.field, { columnLabelKey });
        }
    }
}

