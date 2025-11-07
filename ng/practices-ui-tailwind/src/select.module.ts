import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { PuiSelectDirective, PuiSelectOptionComponent, PuiSelectViewSourceDirective } from '.';

const DEFAULT_SELECT_COMPONENT_IMPORTS = [
    PuiSelectViewSourceDirective,
    PuiSelectOptionComponent,
    PuiSelectDirective,
    NgSelectModule,
];
@NgModule({
    imports: DEFAULT_SELECT_COMPONENT_IMPORTS,
    exports: DEFAULT_SELECT_COMPONENT_IMPORTS,
})
export class PracticesTailwindSelectComponentsModule {}

