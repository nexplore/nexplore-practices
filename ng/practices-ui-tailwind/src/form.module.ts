import { NgModule } from '@angular/core';

import { NgSelectModule } from '@ng-select/ng-select';
import { PuiButtonDirective } from './lib/button/button.directive';
import { PuiCheckboxGroupComponent } from './lib/checkbox/checkbox-group.component';
import { PuiCheckboxComponent } from './lib/checkbox/checkbox.component';
import { PuiClickCommandDirective } from './lib/command/click-command.directive';
import { PuiReadonlyDirective } from '@nexplore/practices-ng-forms';
import { PuiCalendarComponent } from './lib/date-input/calendar/calendar.component';
import { PuiDateInputDirective } from './lib/date-input/date-input.directive';
import { PuiMonthInputDirective } from './lib/date-input/month-input.directive';
import { PuiYearInputDirective } from './lib/date-input/year-input.directive';
import { PuiFileInputDirective } from './lib/file-input/file-input.directive';
import { PuiFormFieldComponent } from './lib/form-field/form-field.component';
import { PuiLabelDirective } from './lib/form-field/label.directive';
import { PuiNoticeDirective } from './lib/form-field/notice.directive';
import { PuiFormDirective } from '@nexplore/practices-ng-forms';
import { PuiInputDirective } from './lib/input/input.directive';
import { PuiRadioButtonGroupComponent } from './lib/radio-button/radio-button-group.component';
import { PuiRadioButtonComponent } from './lib/radio-button/radio-button.component';
import { PuiSelectOptionComponent } from './lib/select/select-option.component';
import { PuiSelectViewSourceDirective } from './lib/select/select-view-source.directive';
import { PuiSelectDirective } from './lib/select/select.directive';

export const DEFAULT_FORM_COMPONENT_IMPORTS = [
    PuiFormDirective,
    PuiFormFieldComponent,
    PuiInputDirective,
    PuiLabelDirective,
    PuiNoticeDirective,
    PuiRadioButtonGroupComponent,
    PuiRadioButtonComponent,
    PuiDateInputDirective,
    PuiMonthInputDirective,
    PuiYearInputDirective,
    PuiFileInputDirective,
    PuiCalendarComponent,
    PuiCheckboxGroupComponent,
    PuiCheckboxComponent,
    PuiButtonDirective,
    PuiClickCommandDirective,
    PuiSelectDirective,
    PuiSelectViewSourceDirective,
    PuiSelectOptionComponent,
    PuiReadonlyDirective,
    NgSelectModule,
];

@NgModule({
    imports: DEFAULT_FORM_COMPONENT_IMPORTS,
    exports: DEFAULT_FORM_COMPONENT_IMPORTS,
})
export class PracticesTailwindFormComponentsModule {}
