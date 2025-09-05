import { NgModule } from '@angular/core';
import {
    PuibeShellComponent,
    PuibeStatusHubComponent,
    PuibeSideNavigationComponent,
    PuibeHeaderComponent,
    PuibeFooterComponent,
    PuibeFooterCopyrightDirective,
    PuibeHeaderDirective,
    PuibeFooterDirective,
    PuibeBreadcrumbComponent,
    PuibeHeaderLogoComponent,
    PuibeGlobalDirtyGuardDirective,
    MODAL_PROVIDERS,
} from '.';

const SHELL_COMPONENT_IMPORTS = [
    PuibeShellComponent,
    PuibeStatusHubComponent,
    PuibeSideNavigationComponent,
    PuibeHeaderComponent,
    PuibeFooterComponent,
    PuibeFooterCopyrightDirective,
    PuibeHeaderDirective,
    PuibeFooterDirective,
    PuibeBreadcrumbComponent,
    PuibeHeaderLogoComponent,
    PuibeGlobalDirtyGuardDirective,
];

@NgModule({
    imports: SHELL_COMPONENT_IMPORTS,
    exports: SHELL_COMPONENT_IMPORTS,
    providers: [...MODAL_PROVIDERS],
})
export class PracticesKtbeShellModule {}
