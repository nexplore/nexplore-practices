import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PuibeContainerDirective } from '../common/container.directive';
import { NgClass } from '@angular/common';

@Component({
    standalone: true,
    selector: 'puibe-footer',
    templateUrl: './footer.component.html',
    imports: [PuibeContainerDirective, TranslateModule, NgClass],
})
export class PuibeFooterComponent {
    /**
     * Sets the breakpoint for when the items should be aligned horizontally and not be wrapping anymore.
     */
    @Input()
    flexBreakpoint: 'md' | 'lg' = 'md';
}
