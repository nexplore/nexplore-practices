import { Directive, HostBinding } from '@angular/core';
@Directive({
    standalone: true,
    selector: 'puibe-table-cell[hoverEmphasis]',
})
export class PuibeTableHoverEmphasisDirective {
    @HostBinding('class')
    className = 'group-hover:decoration-red group-hover:underline';
}
