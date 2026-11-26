import { NgModule } from '@angular/core';
import { PuiGlobalDirtyGuardDirective } from '@nexplore/practices-ng-dirty-guard';
import {
    MODAL_PROVIDERS,
    PuiBreadcrumbComponent,
    PuiFooterComponent,
    PuiFooterCopyrightDirective,
    PuiFooterDirective,
    PuiHeaderComponent,
    PuiHeaderDirective,
    PuiHeaderLogoComponent,
    PuiShellComponent,
    PuiSideNavigationComponent,
    PuiStatusHubComponent,
} from '.';

const SHELL_COMPONENT_IMPORTS = [
    PuiShellComponent,
    PuiStatusHubComponent,
    PuiSideNavigationComponent,
    PuiHeaderComponent,
    PuiFooterComponent,
    PuiFooterCopyrightDirective,
    PuiHeaderDirective,
    PuiFooterDirective,
    PuiBreadcrumbComponent,
    PuiHeaderLogoComponent,
    PuiGlobalDirtyGuardDirective,
];

@NgModule({
    imports: SHELL_COMPONENT_IMPORTS,
    exports: SHELL_COMPONENT_IMPORTS,
    providers: [...MODAL_PROVIDERS],
})
export class PracticesTailwindShellModule {}

