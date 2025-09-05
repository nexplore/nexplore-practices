import { NgModule } from '@angular/core';
import { PuibeSelectDirective, PuibeSelectOptionComponent, PuibeSelectViewSourceDirective } from '.';
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
