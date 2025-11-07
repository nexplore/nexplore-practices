import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { NgClass } from '@angular/common';
import { PuiContainerDirective } from '../common/container.directive';

@Component({
    standalone: true,
    selector: 'pui-footer',
    templateUrl: './footer.component.html',
    imports: [PuiContainerDirective, TranslateModule, NgClass],
})
export class PuiFooterComponent {
    /**
     * Sets the breakpoint for when the items should be aligned horizontally and not be wrapping anymore.
     */
    @Input()
    flexBreakpoint: 'md' | 'lg' = 'md';
}

