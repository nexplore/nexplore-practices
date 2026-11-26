import { Directive, HostBinding } from '@angular/core';
@Directive({
    standalone: true,
    selector: 'pui-table-cell[hoverEmphasis]',
})
export class PuiTableHoverEmphasisDirective {
    @HostBinding('class')
    className = 'group-hover:decoration-brand group-hover:underline';
}

