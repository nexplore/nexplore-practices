import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { FORM_CONFIG } from '../form/form.config';

@Component({
    standalone: true,
    selector: 'puibe-readonly-label-value',
    templateUrl: './readonly-label-value.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, TranslateModule],
})
export class PuibeReadonlyLabelValueComponent {
    readonly themeConfig = inject(FORM_CONFIG, { optional: true });
    readonly useSmallLabelFallback = this.themeConfig?.useSmallTextForReadonlyLabel;

    @Input()
    label: string;

    @Input()
    useSmallLabel: boolean | null = null;
}

/**
 * @deprecated Renamed to `PuibeReadonlyLabelValueComponent`. Use the renamed component instead.
 */
export type PuibeReadonyLabelValueComponent = PuibeReadonlyLabelValueComponent;
