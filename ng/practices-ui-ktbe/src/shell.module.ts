import { NgModule } from '@angular/core';
import { PuibeBreadcrumbComponent } from './lib/breadcrumb/breadcrumb.component';
import { PuibeGlobalDirtyGuardDirective } from './lib/dirty-guard/dirty-guard.directive';
import { PuibeFooterCopyrightDirective } from './lib/footer/footer-copyright.directive';
import { PuibeFooterComponent } from './lib/footer/footer.component';
import { PuibeHeaderLogoComponent } from './lib/header/header-logo.component';
import { PuibeHeaderComponent } from './lib/header/header.component';
import { MODAL_PROVIDERS } from './lib/popup/providers';
import { PuibeFooterDirective } from './lib/shell/footer.directive';
import { PuibeHeaderDirective } from './lib/shell/header.directive';
import { PuibeShellComponent } from './lib/shell/shell.component';
import { PuibeSideNavigationComponent } from './lib/side-navigation/side-navigation.component';
import { PuibeStatusHubComponent } from './lib/status-hub/status-hub.component';

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
