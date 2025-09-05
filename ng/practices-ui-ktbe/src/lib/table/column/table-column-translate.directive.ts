import { AfterViewInit, Directive, Input, inject } from '@angular/core';
import { DestroyService } from '@nexplore/practices-ui';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs';
import { PuibeTableComponent } from '../table.component';
import { PuibeTableColumnComponent } from './table-column.component';

/**
 * The directive adds the ability to translate the column label by its content.
 * Example:
 * ```
 * <puibe-table-column translate>Labels.xyz</puibe-table-column>
 * ```
 *
 * Notice: This directive is a workaround for the fact that the ngx translate directive does not properly work on the slotted content of a component.
 */
@Directive({
    selector: 'puibe-table-column[translate]',
    standalone: true,
    providers: [DestroyService],
})
export class PuibeTableColumnTranslateDirective implements AfterViewInit {
    private _table = inject(PuibeTableComponent);
    private _columnComponent = inject(PuibeTableColumnComponent);
    private _translate = inject(TranslateService);
    private _destroy = inject(DestroyService);

    @Input() translate: string;

    @Input()
    set translateParams(value: any) {
        this._table?.patchColumn(this._columnComponent.field, { columnLabelKeyParams: value });
    }

    ngAfterViewInit(): void {
        // If the columnLabelKey is set to empty string, it means the `translate` input was set without an parameter, like
        // `<puibe-table-column translate>Labels.xyz</puibe-table-column>`.
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
