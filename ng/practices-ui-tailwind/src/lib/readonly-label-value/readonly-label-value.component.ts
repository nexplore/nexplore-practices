import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { FORM_CONFIG } from '../form/form.config';

@Component({
    standalone: true,
    selector: 'pui-readonly-label-value',
    templateUrl: './readonly-label-value.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass, TranslateModule],
})
export class PuiReadonyLabelValueComponent {
    readonly themeConfig = inject(FORM_CONFIG, { optional: true });
    readonly useSmallLabelFallback = this.themeConfig?.useSmallTextForReadonlyLabel;

    @Input()
    label: string;

    @Input()
    useSmallLabel: boolean | null = null;
}

