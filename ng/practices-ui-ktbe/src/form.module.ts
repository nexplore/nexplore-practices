import { NgModule } from '@angular/core';

import { NgSelectModule } from '@ng-select/ng-select';
import { PuibeFormDirective } from './lib/form/form.directive';
import { PuibeFormFieldComponent } from './lib/form-field/form-field.component';
import { PuibeInputDirective } from './lib/input/input.directive';
import { PuibeLabelDirective } from './lib/form-field/label.directive';
import { PuibeNoticeDirective } from './lib/form-field/notice.directive';
import { PuibeRadioButtonGroupComponent } from './lib/radio-button/radio-button-group.component';
import { PuibeRadioButtonComponent } from './lib/radio-button/radio-button.component';
import { PuibeDateInputDirective } from './lib/date-input/date-input.directive';
import { PuibeMonthInputDirective } from './lib/date-input/month-input.directive';
import { PuibeYearInputDirective } from './lib/date-input/year-input.directive';
import { PuibeFileInputDirective } from './lib/file-input/file-input.directive';
import { PuibeCalendarComponent } from './lib/date-input/calendar/calendar.component';
import { PuibeCheckboxGroupComponent } from './lib/checkbox/checkbox-group.component';
import { PuibeCheckboxComponent } from './lib/checkbox/checkbox.component';
import { PuibeButtonDirective } from './lib/button/button.directive';
import { PuibeClickCommandDirective } from './lib/command/click-command.directive';
import { PuibeSelectDirective } from './lib/select/select.directive';
import { PuibeSelectViewSourceDirective } from './lib/select/select-view-source.directive';
import { PuibeSelectOptionComponent } from './lib/select/select-option.component';
import { PuibeReadonlyDirective } from './lib/common/readonly.directive';

export const DEFAULT_FORM_COMPONENT_IMPORTS = [
    PuibeFormDirective,
    PuibeFormFieldComponent,
    PuibeInputDirective,
    PuibeLabelDirective,
    PuibeNoticeDirective,
    PuibeRadioButtonGroupComponent,
    PuibeRadioButtonComponent,
    PuibeDateInputDirective,
    PuibeMonthInputDirective,
    PuibeYearInputDirective,
    PuibeFileInputDirective,
    PuibeCalendarComponent,
    PuibeCheckboxGroupComponent,
    PuibeCheckboxComponent,
    PuibeButtonDirective,
    PuibeClickCommandDirective,
    PuibeSelectDirective,
    PuibeSelectViewSourceDirective,
    PuibeSelectOptionComponent,
    PuibeReadonlyDirective,
    NgSelectModule,
];

@NgModule({
    imports: DEFAULT_FORM_COMPONENT_IMPORTS,
    exports: DEFAULT_FORM_COMPONENT_IMPORTS,
})
export class PracticesKtbeFormComponentsModule {}
