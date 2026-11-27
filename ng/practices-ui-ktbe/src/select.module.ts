import { NgModule } from '@angular/core';
import { PuibeSelectOptionComponent } from './lib/select/select-option.component';
import { PuibeSelectViewSourceDirective } from './lib/select/select-view-source.directive';
import { PuibeSelectDirective } from './lib/select/select.directive';
import { NgSelectModule } from '@ng-select/ng-select';

const DEFAULT_SELECT_COMPONENT_IMPORTS = [
    PuibeSelectViewSourceDirective,
    PuibeSelectOptionComponent,
    PuibeSelectDirective,
    NgSelectModule,
];
@NgModule({
    imports: DEFAULT_SELECT_COMPONENT_IMPORTS,
    exports: DEFAULT_SELECT_COMPONENT_IMPORTS,
})
export class PracticesKtbeSelectComponentsModule {}
