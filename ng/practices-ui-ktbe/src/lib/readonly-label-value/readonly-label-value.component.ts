import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

import { FORM_CONFIG } from '../form/form.config';

@Component({
    standalone: true,
    selector: 'puibe-readonly-label-value',
    templateUrl: './readonly-label-value.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass],
})
export class PuibeReadonlyLabelValueComponent {
    readonly themeConfig = inject(FORM_CONFIG, { optional: true });
    readonly useSmallLabelFallback = this.themeConfig?.useSmallTextForReadonlyLabel;

    @Input()
    label: string;

    @Input()
    useSmallLabel: boolean | null = null;
}

// A re-export instead of a second component: two components with the same metadata get the same component ID (NG0912).
// Unlike a `const` alias, a re-export still resolves to the decorated class in the published typings.
export {
    /**
     * @deprecated Deprecated due to typo in name ('Readony' instead of 'Readonly'). Use `PuibeReadonlyLabelValueComponent` instead.
     */
    PuibeReadonlyLabelValueComponent as PuibeReadonyLabelValueComponent,
};
